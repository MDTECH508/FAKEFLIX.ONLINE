// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useRouteFocused } = require('stremio-router');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button, Image, Popup } = require('stremio/components');
const useBinaryState = require('stremio/common/useBinaryState');
const useProfile = require('stremio/common/useProfile');
const VideoPlaceholder = require('./VideoPlaceholder');
const styles = require('./styles');

const Video = ({ 
    className, 
    id, 
    title, 
    thumbnail, 
    year, 
    rating,
    genre,
    duration,
    watched, 
    progress, 
    selected, 
    deepLinks, 
    onMarkVideoAsWatched, 
    ...props 
}) => {
    const routeFocused = useRouteFocused();
    const profile = useProfile();
    const { t } = useTranslation();
    const [menuOpen, , closeMenu, toggleMenu] = useBinaryState(false);

    // Gestion des événements du menu contextuel
    const popupLabelOnMouseUp = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented) {
            if (event.nativeEvent.ctrlKey || event.nativeEvent.button === 2) {
                event.preventDefault();
                toggleMenu();
            }
        }
    }, [toggleMenu]);

    const popupLabelOnContextMenu = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented && !event.nativeEvent.ctrlKey) {
            event.preventDefault();
        }
    }, [toggleMenu]);

    const popupLabelOnLongPress = React.useCallback((event) => {
        if (event.nativeEvent.pointerType !== 'mouse' && !event.nativeEvent.togglePopupPrevented) {
            toggleMenu();
        }
    }, [toggleMenu]);

    const popupMenuOnPointerDown = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);

    const popupMenuOnContextMenu = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);

    const popupMenuOnClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);

    const popupMenuOnKeyDown = React.useCallback((event) => {
        event.nativeEvent.buttonClickPrevented = true;
    }, []);

    // Basculer le statut "regardé"
    const toggleWatchedOnClick = React.useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        onMarkVideoAsWatched({ id, year }, watched);
    }, [id, year, watched, closeMenu, onMarkVideoAsWatched]);

    // Lecture du film
    const videoButtonOnClick = React.useCallback(() => {
        if (deepLinks) {
            if (typeof deepLinks.player === 'string') {
                window.location = deepLinks.player;
            } else if (typeof deepLinks.metaDetailsStreams === 'string') {
                window.location.replace(deepLinks.metaDetailsStreams);
            }
        }
    }, [deepLinks]);

    // Formatage de la durée
    const formatDuration = React.useCallback((minutes) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }, []);

    // Rendu du label (carte du film)
    const renderLabel = React.useMemo(() => function renderLabel({ 
        className, 
        id, 
        title, 
        thumbnail, 
        year, 
        rating,
        genre,
        duration,
        watched, 
        progress, 
        children, 
        ref, 
        ...props 
    }) {
        const blurThumbnail = profile.settings.hideSpoilers && !watched;
        const formattedDuration = formatDuration(duration);

        React.useEffect(() => {
            if (selected && ref.current) {
                ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        }, [selected, ref]);

        return (
            <Button 
                {...props} 
                ref={ref} 
                className={classnames(className, styles['video-container'], { 
                    [styles['selected']]: selected 
                })} 
                title={title}
            >
                {/* Section miniature */}
                {typeof thumbnail === 'string' && thumbnail.length > 0 ? (
                    <div className={styles['thumbnail-container']}>
                        <Image
                            className={classnames(styles['thumbnail'], { 
                                [styles['blurred']]: blurThumbnail 
                            })}
                            src={thumbnail}
                            alt={title || ' '}
                            renderFallback={() => (
                                <Icon
                                    className={styles['placeholder-icon']}
                                    name={'film'}
                                />
                            )}
                        />
                        
                        {/* Badge de progression */}
                        {progress !== null && !isNaN(progress) && progress > 0 && (
                            <div className={styles['progress-bar-container']}>
                                <div className={styles['progress-bar']} style={{ width: `${progress}%` }} />
                                <div className={styles['progress-bar-background']} />
                            </div>
                        )}
                        
                        {/* Badge de durée */}
                        {formattedDuration && (
                            <div className={styles['duration-badge']}>
                                {formattedDuration}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles['thumbnail-placeholder']}>
                        <Icon className={styles['placeholder-icon']} name={'film'} />
                    </div>
                )}
                
                {/* Section informations */}
                <div className={styles['info-container']}>
                    <div className={styles['title-container']}>
                        {typeof title === 'string' && title.length > 0 ? title : id}
                    </div>
                    
                    <div className={styles['meta-container']}>
                        {year && (
                            <span className={styles['year']}>{year}</span>
                        )}
                        
                        {rating && (
                            <div className={styles['rating-container']}>
                                <Icon className={styles['star-icon']} name={'star'} />
                                <span className={styles['rating']}>{rating.toFixed(1)}</span>
                            </div>
                        )}
                        
                        {genre && genre.length > 0 && (
                            <span className={styles['genre']}>{genre}</span>
                        )}
                    </div>
                    
                    {/* Statut regardé */}
                    {watched && (
                        <div className={styles['watched-badge']}>
                            <Icon className={styles['eye-icon']} name={'eye'} />
                            <span>{t('CTX_WATCHED')}</span>
                        </div>
                    )}
                </div>
                {children}
            </Button>
        );
    }, [selected, profile.settings.hideSpoilers, formatDuration, t]);

    // Menu contextuel
    const renderMenu = React.useMemo(() => function renderMenu() {
        return (
            <div 
                className={styles['context-menu-content']} 
                onPointerDown={popupMenuOnPointerDown} 
                onContextMenu={popupMenuOnContextMenu} 
                onClick={popupMenuOnClick} 
                onKeyDown={popupMenuOnKeyDown}
            >
                <Button 
                    className={styles['context-menu-option-container']} 
                    title={t('CTX_WATCH')}
                    onClick={videoButtonOnClick}
                >
                    <Icon className={styles['menu-icon']} name={'play'} />
                    <div className={styles['context-menu-option-label']}>{t('CTX_WATCH')}</div>
                </Button>
                
                <Button 
                    className={styles['context-menu-option-container']} 
                    title={watched ? t('CTX_MARK_NON_WATCHED') : t('CTX_MARK_WATCHED')} 
                    onClick={toggleWatchedOnClick}
                >
                    <Icon className={styles['menu-icon']} name={watched ? 'eye-off' : 'eye'} />
                    <div className={styles['context-menu-option-label']}>
                        {watched ? t('CTX_MARK_NON_WATCHED') : t('CTX_MARK_WATCHED')}
                    </div>
                </Button>
            </div>
        );
    }, [watched, toggleWatchedOnClick, videoButtonOnClick, t]);

    // Fermer le menu quand la route change
    React.useEffect(() => {
        if (!routeFocused) {
            closeMenu();
        }
    }, [routeFocused, closeMenu]);

    return (
        <Popup
            className={className}
            id={id}
            title={title}
            thumbnail={thumbnail}
            year={year}
            rating={rating}
            genre={genre}
            duration={duration}
            watched={watched}
            progress={progress}
            onClick={videoButtonOnClick}
            {...props}
            onMouseUp={popupLabelOnMouseUp}
            onLongPress={popupLabelOnLongPress}
            onContextMenu={popupLabelOnContextMenu}
            open={menuOpen}
            onCloseRequest={closeMenu}
            renderLabel={renderLabel}
            renderMenu={renderMenu}
        />
    );
};

Video.Placeholder = VideoPlaceholder;

Video.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    thumbnail: PropTypes.string,
    year: PropTypes.number,
    rating: PropTypes.number,
    genre: PropTypes.string,
    duration: PropTypes.number,
    watched: PropTypes.bool,
    progress: PropTypes.number,
    selected: PropTypes.bool,
    deepLinks: PropTypes.shape({
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
    onMarkVideoAsWatched: PropTypes.func,
};

module.exports = Video;
