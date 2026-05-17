// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { decode } = require('blurhash');
const { default: Button } = require('stremio/components/Button');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles');

const BLURHASH_WIDTH = 32;
const BLURHASH_HEIGHT = 48;

const HomepageItem = React.memo(({ 
    className, 
    id, 
    title, 
    poster, 
    blurHash, 
    type, 
    rating, 
    year, 
    genre, 
    description,
    maturityRating,
    href: customHref 
}) => {
    const href = React.useMemo(() => {
        return typeof customHref === 'string' && customHref.length > 0 ?
            customHref
            :
            `#/metadetails/${type}/${encodeURIComponent(id)}`;
    }, [customHref, type, id]);
    
    const canvasRef = React.useRef(null);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const hoverTimeout = React.useRef();
    const expandTimeout = React.useRef();

    const renderPosterFallback = React.useCallback(() => (
        <Icon className={styles['placeholder-icon']} name={'movies'} />
    ), []);

    // Netwaye timeout yo
    React.useEffect(() => {
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            if (expandTimeout.current) clearTimeout(expandTimeout.current);
        };
    }, []);

    // Jere hover ak expand (Netflix style)
    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            setIsHovered(true);
            // Ekspann apre yon ti moman
            expandTimeout.current = setTimeout(() => {
                setIsExpanded(true);
            }, 300);
        }, 200);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        if (expandTimeout.current) clearTimeout(expandTimeout.current);
        setIsHovered(false);
        setIsExpanded(false);
    };

    React.useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [poster]);

    React.useEffect(() => {
        if (!blurHash || imageLoaded || imageError || !canvasRef.current) {
            return;
        }

        try {
            const pixels = decode(blurHash, BLURHASH_WIDTH, BLURHASH_HEIGHT);
            const canvas = canvasRef.current;
            canvas.width = BLURHASH_WIDTH;
            canvas.height = BLURHASH_HEIGHT;
            const context = canvas.getContext('2d');
            const imageData = context.createImageData(BLURHASH_WIDTH, BLURHASH_HEIGHT);
            imageData.data.set(pixels);
            context.putImageData(imageData, 0, 0);
        } catch (_error) {
            // Invalid blurhash should not break rendering.
        }
    }, [blurHash, imageLoaded, imageError]);

    // Kalkile to (Netflix style badge)
    const ratingValue = rating ? parseFloat(rating) : null;
    const getRatingBadge = () => {
        if (!ratingValue) return null;
        if (ratingValue >= 8) return { label: 'Top 10', class: 'top-rated' };
        if (ratingValue >= 7) return { label: 'Recommend', class: 'recommended' };
        return { label: 'Popular', class: 'popular' };
    };
    
    const ratingBadge = getRatingBadge();

    return (
        <div 
            className={classnames(styles['homepage-item-wrapper'], {
                [styles['expanded']]: isExpanded
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button 
                className={classnames(className, styles['homepage-item-container'], {
                    [styles['hovered']]: isHovered,
                    [styles['expanded']]: isExpanded
                })} 
                title={title} 
                href={href}
            >
                <div className={styles['poster-container']}>
                    <div className={styles['poster-image-layer']}>
                        {
                            blurHash && !imageLoaded && !imageError ?
                                <canvas
                                    ref={canvasRef}
                                    className={styles['blurhash-canvas']}
                                    aria-hidden={'true'}
                                />
                                :
                                null
                        }
                        {
                            poster && !imageError ?
                                <img
                                    className={classnames(styles['poster-image'], { 
                                        [styles['loaded']]: imageLoaded 
                                    })}
                                    src={poster}
                                    alt={title || ' '}
                                    loading={'lazy'}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                                :
                                renderPosterFallback()
                    }
                </div>
                
                {/* Badges Netflix style */}
                <div className={styles['badges-container']}>
                    {ratingBadge && (
                        <div className={classnames(styles['badge'], styles[ratingBadge.class])}>
                            {ratingBadge.label}
                        </div>
                    )}
                    {maturityRating && (
                        <div className={styles['maturity-badge']}>
                            {maturityRating}
                        </div>
                    )}
                    {ratingValue && (
                        <div className={styles['rating-percent']}>
                            {Math.round(ratingValue * 10)}% Match
                        </div>
                    )}
                </div>
                
                {ratingValue && (
                    <div className={styles['rating-badge']}>
                        <Icon className={styles['rating-icon']} name={'star'} />
                        <span className={styles['rating-label']}>{ratingValue.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Netflix style expanded content */}
            {isExpanded && (
                <div className={styles['expanded-content']}>
                    <div className={styles['expanded-actions']}>
                        <button className={styles['play-button']}>
                            <Icon name={'play'} />
                            <span>Play</span>
                        </button>
                        <button className={styles['my-list-button']}>
                            <Icon name={'plus'} />
                        </button>
                        <button className={styles['thumbs-up-button']}>
                            <Icon name={'thumb-up'} />
                        </button>
                        <button className={styles['thumbs-down-button']}>
                            <Icon name={'thumb-down'} />
                        </button>
                    </div>
                    
                    {description && (
                        <div className={styles['expanded-description']}>
                            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
                        </div>
                    )}
                    
                    <div className={styles['expanded-meta']}>
                        {ratingValue && (
                            <span className={styles['match-percent']}>
                                {Math.round(ratingValue * 10)}% Match
                            </span>
                        )}
                        {year && <span className={styles['year']}>{year}</span>}
                        {maturityRating && <span className={styles['maturity']}>{maturityRating}</span>}
                        {type && <span className={styles['type']}>{type === 'movie' ? 'Movie' : 'Series'}</span>}
                    </div>
                    
                    {genre && (
                        <div className={styles['expanded-genres']}>
                            {genre.split(',').slice(0, 3).map((g, i) => (
                                <span key={i} className={styles['genre-tag']}>
                                    {g.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
    </Button>
    </div>
);
});

HomepageItem.displayName = 'HomepageItem';

HomepageItem.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    poster: PropTypes.string,
    blurHash: PropTypes.string,
    type: PropTypes.string,
    rating: PropTypes.string,
    year: PropTypes.string,
    genre: PropTypes.string,
    description: PropTypes.string,
    maturityRating: PropTypes.string,
    href: PropTypes.string,
};

module.exports = HomepageItem;
