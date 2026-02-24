use base64::{Engine as _, engine::general_purpose};
use lazy_static::lazy_static;
use aes::Aes128;
use aes::cipher::{BlockEncryptMut, KeyInit, KeyIvInit, block_padding::Pkcs7};
use md5::{Md5, Digest};
use num_bigint::BigUint;
use rand::RngCore;
use rand::rngs::OsRng;
use rand::Rng;

use crate::query::params_to_query_string;

type Aes128CbcEnc = cbc::Encryptor<Aes128>;
type Aes128EcbEnc = ecb::Encryptor<Aes128>;

lazy_static! {
    static ref IV: [u8; 16] = *b"0102030405060708";
    static ref PRESET_KEY: [u8; 16] = *b"0CoJUm6Qyw8W8jud";
    static ref LINUX_API_KEY: [u8; 16] = *b"rFgB&h#%2?^eDg:Q";
    static ref EAPIKEY: [u8; 16] = *b"e82ckenh8dichen8";
    static ref BASE62: &'static [u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // RSA public key components for NetEase API
    static ref RSA_MODULUS: BigUint = {
        let modulus_b64 = "4LUJ9iWd+GQtvDVmKQFHffImd+wVK1/2is5hW7e3JRUrOrF6h2rqilqnbS5BdinsT\
             uNB9WE1/M9pUoAQTgMS7L2pJVfJOHARSvbJ0FxPfww2hbeka+4lWTJXXM4QtCTYE8/\
             kh10+ggR7l93vUnQdVGuOKJ3Gk1s+zgRi2woiuOc=";
        let bytes = general_purpose::STANDARD.decode(modulus_b64).unwrap();
        BigUint::from_bytes_be(&bytes)
    };
    static ref RSA_EXPONENT: BigUint = BigUint::from(65537u32);
}

pub struct Crypto;

#[allow(non_camel_case_types, dead_code)]
pub enum HashType {
    md5,
}

#[allow(non_camel_case_types)]
pub enum AesMode {
    Cbc,
    Ecb,
}

impl Crypto {
    pub fn hex_random_bytes(n: usize) -> String {
        let mut rng = rand::thread_rng();
        let random_bytes: Vec<u8> = (0..n).map(|_| rng.gen::<u8>()).collect();
        random_bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }

    pub fn eapi(url: &str, text: &str) -> String {
        let message = format!("nobody{}use{}md5forencrypt", url, text);
        let digest = hex::encode(Self::md5_hash(message.as_bytes()));
        let data = format!("{}-36cd479b6b5-{}-36cd479b6b5-{}", url, text, digest);
        let params = Self::aes_encrypt(
            &data,
            &*EAPIKEY,
            AesMode::Ecb,
            None,
            |t| hex::encode_upper(t),
        );
        params_to_query_string(vec![("params", &params)])
    }

    pub fn weapi(text: &str) -> String {
        let mut secret_key = [0u8; 16];
        OsRng.fill_bytes(&mut secret_key);
        let key: Vec<u8> = secret_key
            .iter()
            .map(|i| BASE62[(i % 62) as usize])
            .collect();

        let params1 = Self::aes_encrypt(
            text,
            &*PRESET_KEY,
            AesMode::Cbc,
            Some(&*IV),
            |t| general_purpose::STANDARD.encode(t),
        );

        let params = Self::aes_encrypt(
            &params1,
            &key,
            AesMode::Cbc,
            Some(&*IV),
            |t| general_purpose::STANDARD.encode(t),
        );

        let enc_sec_key =
            Self::rsa_encrypt(std::str::from_utf8(&key.iter().rev().copied().collect::<Vec<u8>>()).unwrap());

        params_to_query_string(vec![
            ("params", &params),
            ("encSecKey", &enc_sec_key),
        ])
    }

    pub fn linuxapi(text: &str) -> String {
        let params = Self::aes_encrypt(
            text,
            &*LINUX_API_KEY,
            AesMode::Ecb,
            None,
            |t| hex::encode(t),
        )
        .to_uppercase();
        params_to_query_string(vec![("eparams", &params)])
    }

    pub fn aes_encrypt(
        data: &str,
        key: &[u8],
        mode: AesMode,
        iv: Option<&[u8]>,
        encode: fn(&[u8]) -> String,
    ) -> String {
        let data_bytes = data.as_bytes();
        // Allocate enough space for data + one full block of padding
        let mut buf = vec![0u8; data_bytes.len() + 16];
        buf[..data_bytes.len()].copy_from_slice(data_bytes);

        match mode {
            AesMode::Cbc => {
                let iv_bytes = iv.unwrap_or(&[0u8; 16]);
                let enc = Aes128CbcEnc::new_from_slices(key, iv_bytes)
                    .expect("Invalid key/iv length for CBC");
                let cipher_text = enc
                    .encrypt_padded_mut::<Pkcs7>(&mut buf, data_bytes.len())
                    .expect("CBC encryption failed");
                encode(cipher_text)
            }
            AesMode::Ecb => {
                let enc = Aes128EcbEnc::new_from_slice(key).expect("Invalid key length for ECB");
                let cipher_text = enc
                    .encrypt_padded_mut::<Pkcs7>(&mut buf, data_bytes.len())
                    .expect("ECB encryption failed");
                encode(cipher_text)
            }
        }
    }

    /// RSA encrypt with no padding — raw modpow: m^e mod n
    pub fn rsa_encrypt(data: &str) -> String {
        let data_bytes = data.as_bytes();
        // Pad data to 128 bytes with leading zeros
        let mut padded = vec![0u8; 128 - data_bytes.len()];
        padded.extend_from_slice(data_bytes);

        let m = BigUint::from_bytes_be(&padded);
        let c = m.modpow(&*RSA_EXPONENT, &*RSA_MODULUS);

        // Convert to hex, pad to 256 hex chars (128 bytes)
        format!("{:0>256x}", c)
    }

    fn md5_hash(data: &[u8]) -> Vec<u8> {
        let mut hasher = Md5::new();
        hasher.update(data);
        hasher.finalize().to_vec()
    }

    #[allow(dead_code)]
    pub fn hash_encrypt(data: &str, algorithm: HashType, encode: fn(&[u8]) -> String) -> String {
        match algorithm {
            HashType::md5 => encode(&Self::md5_hash(data.as_bytes())),
        }
    }
}
