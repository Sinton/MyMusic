import React from 'react';
import { SidebarSection } from '../../hooks/useSidebarData';
import { SidebarTreeItem } from './SidebarTreeItem';
import { SidebarPlatformHeader } from './SidebarPlatformHeader';
import { SidebarSubHeader } from './SidebarSubHeader';

interface PlaylistTreeProps {
    sections: SidebarSection[];
    activeView: string;
    onNavigate: (view: string) => void;
    isGroupExpanded: (id: string) => boolean;
    onToggleGroup: (id: string) => void;
    onCreatePlaylist: () => void;
}

export const PlaylistTree: React.FC<PlaylistTreeProps> = ({
    sections,
    activeView,
    onNavigate,
    isGroupExpanded,
    onToggleGroup,
    onCreatePlaylist
}) => {
    return (
        <div className="flex-1 px-2 overflow-y-auto custom-scrollbar pt-1 min-h-0" style={{ scrollbarGutter: 'stable' }}>
            <div className="space-y-1.5">
                {sections.map((section) => {
                    const isSectionExpanded = isGroupExpanded(section.id);

                    return (
                        <div key={section.id} className="space-y-0.5">
                            <SidebarPlatformHeader
                                id={section.id}
                                title={section.title}
                                isExpanded={isSectionExpanded}
                                onToggle={() => onToggleGroup(section.id)}
                                onCreateClick={section.id === 'vibe' ? onCreatePlaylist : undefined}
                            />

                            {isSectionExpanded && (
                                <div className="animate-slide-down space-y-0.5">
                                    {section.type === 'simple' ? (
                                        section.items?.map(pl => (
                                            <SidebarTreeItem
                                                key={`vibe-${pl.id}`}
                                                playlist={pl}
                                                activeView={activeView}
                                                onNavigate={onNavigate}
                                            />
                                        ))
                                    ) : (
                                        <>
                                            {section.liked && (
                                                <SidebarTreeItem
                                                    playlist={section.liked}
                                                    activeView={activeView}
                                                    onNavigate={onNavigate}
                                                />
                                            )}

                                            {section.created && section.created.length > 0 && (
                                                <>
                                                    <SidebarSubHeader
                                                        label="创建的歌单"
                                                        isExpanded={isGroupExpanded(`${section.id}_created`)}
                                                        onToggle={() => onToggleGroup(`${section.id}_created`)}
                                                    />
                                                    {isGroupExpanded(`${section.id}_created`) && section.created.map(pl => (
                                                        <SidebarTreeItem
                                                            key={`${section.id}-created-${pl.id}`}
                                                            playlist={pl}
                                                            activeView={activeView}
                                                            onNavigate={onNavigate}
                                                            isNested
                                                        />
                                                    ))}
                                                </>
                                            )}

                                            {section.collected && section.collected.length > 0 && (
                                                <>
                                                    <SidebarSubHeader
                                                        label="收藏的歌单"
                                                        isExpanded={isGroupExpanded(`${section.id}_collected`)}
                                                        onToggle={() => onToggleGroup(`${section.id}_collected`)}
                                                    />
                                                    {isGroupExpanded(`${section.id}_collected`) && section.collected.map(pl => (
                                                        <SidebarTreeItem
                                                            key={`${section.id}-collected-${pl.id}`}
                                                            playlist={pl}
                                                            activeView={activeView}
                                                            onNavigate={onNavigate}
                                                            isNested
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
