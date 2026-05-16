// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const filterInvalidDOMProps = require('filter-invalid-dom-props').default;
const { default: Icon } = require('@stremio/stremio-icons/react');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const Multiselect = require('stremio/components/Multiselect');
const useBinaryState = require('stremio/common/useBinaryState');
const { ICON_FOR_TYPE } = require('stremio/common/CONSTANTS');
const styles = require('./styles');

const MetaItem = React.memo(({ 
    className, 
    type, 
    name, 
    poster, 
    posterShape, 
    posterChangeCursor, 
    progress, 
    newVideos, 
    options, 
    deepLinks, 
    dataset, 
    optionOnSelect, 
    onDismissClick, 
    onPlayClick, 
    watched,
    rating,
    year,
    duration,
    isTrending,
    isNew,
    onAddToWatchlist,
    onShare,
    isInWatchlist = false,
    ...props 
}) => {
    const { t } = useTranslation();
    const [menuOpen, onMenuOpen, onMenuClose] = useBinaryState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Générer le lien href
    const href = React.useMemo(() => {
        return deepLinks ?
            typeof deepLinks.metaDetailsStreams === 'string' ?
                deepLinks.metaDetailsStreams
                :
                typeof deepLinks.metaDetailsVideos === 'string' ?
                    deepLinks.metaDetailsVideos
                    :
                    typeof deepLinks.player === 'string' ?
                        deepLinks.player
                        :
                        null
            :
            null;
    }, [deepLinks]);

    // Gestionnaires d'événements
    const metaItemOnClick = React.useCallback((event) => {
        if (event.nativeEvent.selectPrevented) {
            event.preventDefault();
        } else if (typeof props.onClick === 'function') {
            props.onClick(event);
        }
    }, [props.onClick]);

    const menuOnClick = React.useCallback((event) => {
        event.nativeEvent.selectPrevented = true;
    }, []);

    const menuOnSelect = React.useCallback((event) => {
        if (typeof optionOnSelect === 'function') {
            optionOnSelect({
                type: 'select-option',
                value: event.value,
                dataset: dataset,
                reactEvent: event.reactEvent,
                nativeEvent: event.nativeEvent
            });
        }
    }, [dataset, optionOnSelect]);

    const handleMouseEnter = React.useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = React.useCallback(() => {
        setIsHovered(false);
    }, []);

    const handleAddToWatchlist = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onAddToWatchlist === 'function') {
            onAddToWatchlist({ id: dataset?.id, name, type });
        }
    }, [onAddToWatchlist, dataset, name, type]);

    const handleShare = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onShare === 'function') {
            onShare({ id: dataset?.id, name, type });
        }
    }, [onShare, dataset, name, type]);

    // Rendu du fallback pour l'image
    const renderPosterFallback = React.useCallback(() => (
        <div className={styles['fallback-container']}>
            <Icon
                className={styles['placeholder-icon']}
                name={ICON_FOR_TYPE.has(type) ? ICON_FOR_TYPE.get(type) : ICON_FOR_TYPE.get('other')}
            />
        </div>
    ), [type]);

    // Rendu du contenu du menu
    const renderMenuLabelContent = React.useCallback(() => (
        <div className={styles['menu-trigger']}>
            <Icon className={styles['icon']} name={'more-vertical'} />
        </div>
    ), []);

    // Formater la durée
    const formatDuration = React.useCallback((minutes) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }, []);

    // Options du menu enrichies
    const enhancedOptions = React.useMemo(() => {
        const baseOptions = Array.isArray(options) ? [...options] : [];
        
        if (onAddToWatchlist) {
            baseOptions.push({
                label: isInWatchlist ? t('REMOVE_FROM_WATCHLIST') : t('ADD_TO_WATCHLIST'),
                value: 'watchlist',
                icon: isInWatchlist ? 'checkmark' : 'plus'
            });
        }
        
        if (onShare) {
            baseOptions.push({
                label: t('SHARE'),
                value: 'share',
                icon: 'share'
            });
        }
        
        return baseOptions;
    }, [options, onAddToWatchlist, onShare, isInWatchlist, t]);

    const formattedDuration = formatDuration(duration);

    return (
        <Button 
            title={name} 
            href={href} 
            {...filterInvalidDOMProps(props)} 
            className={classnames(className, styles['meta-item-container'], styles['poster-shape-poster'], styles[`poster-shape-${posterShape}`], { 
                'active': menuOpen,
                [styles['hovered']]: isHovered,
                [styles['watched-item']]: watched
            })} 
            onClick={metaItemOnClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={classnames(styles['poster-container'], { 
                'poster-change-cursor': posterChangeCursor,
                [styles['image-loaded']]: imageLoaded
            })}>
                {/* Bouton dismiss */}
                {onDismissClick && (
                    <div 
                        title={t('LIBRARY_RESUME_DISMISS')} 
                        className={styles['dismiss-icon-layer']} 
                        onClick={onDismissClick}
                    >
                        <Icon className={styles['dismiss-icon']} name={'close'} />
                        <div className={styles['dismiss-icon-backdrop']} />
                    </div>
                )}
                
                {/* Badge regardé */}
                {watched && (
                    <div className={styles['watched-icon-layer']}>
                        <Icon className={styles['watched-icon']} name={'checkmark'} />
                    </div>
                )}
                
                {/* Badge tendance */}
                {isTrending && (
                    <div className={styles['trending-badge']}>
                        <Icon className={styles['trending-icon']} name={'trending-up'} />
                        <span>{t('TRENDING')}</span>
                    </div>
                )}
                
                {/* Badge nouveau */}
                {isNew && (
                    <div className={styles['new-badge']}>
                        <span>{t('NEW')}</span>
                    </div>
                )}
                
                {/* Image d'affiche */}
                <div className={styles['poster-image-layer']}>
                    <Image
                        className={classnames(styles['poster-image'], {
                            [styles['image-hidden']]: !imageLoaded
                        })}
                        src={poster}
                        alt={name || ' '}
                        onLoad={() => setImageLoaded(true)}
                        renderFallback={renderPosterFallback}
                    />
                    {!imageLoaded && (
                        <div className={styles['image-skeleton']} />
                    )}
                </div>
                
                {/* Bouton play au survol */}
                {onPlayClick && isHovered && (
                    <div 
                        title={t('CONTINUE_WATCHING')} 
                        className={styles['play-icon-layer']} 
                        onClick={onPlayClick}
                    >
                        <Icon className={styles['play-icon']} name={'play'} />
                        <div className={styles['play-icon-outer']} />
                        <div className={styles['play-icon-background']} />
                    </div>
                )}
                
                {/* Barre de progression */}
                {progress > 0 && (
                    <div className={styles['progress-bar-layer']}>
                        <div className={styles['progress-bar']} style={{ width: `${progress}%` }} />
                        <div className={styles['progress-bar-background']} />
                    </div>
                )}
                
                {/* Badge de durée */}
                {formattedDuration && !isHovered && (
                    <div className={styles['duration-badge']}>
                        {formattedDuration}
                    </div>
                )}
                
                {/* Badge de note */}
                {rating && !isHovered && (
                    <div className={styles['rating-badge']}>
                        <Icon className={styles['star-icon']} name={'star'} />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}
                
                {/* Nouveaux épisodes/videos */}
                {newVideos > 0 && (
                    <div className={styles['new-videos']}>
                        <div className={styles['layer']} />
                        <div className={styles['layer']} />
                        <div className={styles['layer']}>
                            <Icon className={styles['icon']} name={'add'} />
                            <div className={styles['label']}>
                                {newVideos}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Barre de titre avec informations */}
            {((typeof name === 'string' && name.length > 0) || (Array.isArray(enhancedOptions) && enhancedOptions.length > 0)) && (
                <div className={styles['title-bar-container']}>
                    <div className={styles['title-info']}>
                        <div className={styles['title-label']}>
                            {typeof name === 'string' && name.length > 0 ? name : ''}
                        </div>
                        {year && (
                            <div className={styles['year-label']}>
                                {year}
                            </div>
                        )}
                    </div>
                    {Array.isArray(enhancedOptions) && enhancedOptions.length > 0 && (
                        <Multiselect
                            className={styles['menu-label-container']}
                            renderLabelContent={renderMenuLabelContent}
                            options={enhancedOptions}
                            onOpen={onMenuOpen}
                            onClose={onMenuClose}
                            onSelect={menuOnSelect}
                            tabIndex={-1}
                            onClick={menuOnClick}
                        />
                    )}
                </div>
            )}
            
            {/* Overlay au survol avec actions rapides */}
            {isHovered && (
                <div className={styles['quick-actions-overlay']}>
                    {onAddToWatchlist && (
                        <button 
                            className={classnames(styles['quick-action-btn'], {
                                [styles['in-watchlist']]: isInWatchlist
                            })}
                            onClick={handleAddToWatchlist}
                            title={isInWatchlist ? t('REMOVE_FROM_WATCHLIST') : t('ADD_TO_WATCHLIST')}
                        >
                            <Icon name={isInWatchlist ? 'checkmark' : 'plus'} />
                        </button>
                    )}
                    {onShare && (
                        <button 
                            className={styles['quick-action-btn']}
                            onClick={handleShare}
                            title={t('SHARE')}
                        >
                            <Icon name={'share'} />
                        </button>
                    )}
                </div>
            )}
        </Button>
    );
});

MetaItem.displayName = 'MetaItem';

MetaItem.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    poster: PropTypes.string,
    posterShape: PropTypes.oneOf(['poster', 'landscape', 'square']),
    posterChangeCursor: PropTypes.bool,
    progress: PropTypes.number,
    newVideos: PropTypes.number,
    options: PropTypes.array,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
    dataset: PropTypes.object,
    optionOnSelect: PropTypes.func,
    onDismissClick: PropTypes.func,
    onPlayClick: PropTypes.func,
    onClick: PropTypes.func,
    watched: PropTypes.bool,
    // Nouvelles props
    rating: PropTypes.number,
    year: PropTypes.number,
    duration: PropTypes.number,
    isTrending: PropTypes.bool,
    isNew: PropTypes.bool,
    onAddToWatchlist: PropTypes.func,
    onShare: PropTypes.func,
    isInWatchlist: PropTypes.bool
};

module.exports = MetaItem;
