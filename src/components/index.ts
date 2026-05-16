// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { default: Image } = require('stremio/components/Image');
const styles = require('./styles');

// Genre color mapping
const GENRE_COLORS = {
    action: '#E74C3C',
    drama: '#9B59B6',
    comedy: '#F39C12',
    horror: '#2C3E50',
    romance: '#E91E63',
    thriller: '#34495E',
    'sci-fi': '#3498DB',
    fantasy: '#8E44AD',
    animation: '#1ABC9C',
    documentary: '#95A5A6',
    adventure: '#16A085',
    crime: '#7F8C8D',
    mystery: '#C0392B',
    family: '#27AE60',
    war: '#34495E',
    history: '#8B4513',
    western: '#D2B48C'
};

// Quality color mapping
const QUALITY_COLORS = {
    '360p': '#4CAF50',
    '480p': '#2196F3',
    '720p': '#FF9800',
    '1080p': '#F44336',
    '4k': '#9C27B0'
};

const MediaBadge = React.memo(({ type, value, color, ...props }) => {
    const getColor = React.useCallback(() => {
        if (color) return color;
        
        if (type === 'genre') {
            return GENRE_COLORS[value?.toLowerCase()] || '#95A5A6';
        }
        
        if (type === 'quality') {
            return QUALITY_COLORS[value] || '#9C27B0';
        }
        
        return '#95A5A6';
    }, [type, value, color]);

    return (
        <span
            className={classnames(styles['media-badge'], styles[`badge-${type}`])}
            style={{ '--badge-color': getColor() }}
            {...props}
        >
            {value}
        </span>
    );
});

MediaBadge.displayName = 'MediaBadge';

MediaBadge.propTypes = {
    type: PropTypes.oneOf(['quality', 'genre']),
    value: PropTypes.string,
    color: PropTypes.string
};

const EnhancedMetaItem = React.memo(({
    className,
    name,
    poster,
    posterShape,
    genres,
    quality,
    imdbScore,
    onPlayClick,
    ...props
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const handlePlayClick = React.useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof onPlayClick === 'function') {
            onPlayClick(event);
        }
    }, [onPlayClick]);

    return (
        <div
            className={classnames(
                className,
                styles['enhanced-meta-item-container'],
                styles[`poster-shape-${posterShape || 'poster'}`]
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            {/* Poster Container */}
            <div className={styles['poster-wrapper']}>
                {/* Poster Image */}
                <div className={styles['poster-container']}>
                    <Image
                        className={styles['poster-image']}
                        src={poster}
                        alt={name || 'Media Poster'}
                        renderFallback={() => (
                            <Icon
                                className={styles['placeholder-icon']}
                                name="image"
                            />
                        )}
                    />
                </div>

                {/* Glass Overlay */}
                <div
                    className={classnames(styles['glass-overlay'], {
                        [styles['visible']]: isHovered
                    })}
                >
                    {/* Play Button */}
                    {onPlayClick && (
                        <button
                            className={styles['play-button']}
                            onClick={handlePlayClick}
                            title="Play"
                            aria-label="Play"
                        >
                            <Icon
                                className={styles['play-icon']}
                                name="play"
                            />
                        </button>
                    )}

                    {/* Info Section */}
                    <div className={styles['overlay-info']}>
                        {/* Quality Badge */}
                        {quality && (
                            <div className={styles['quality-section']}>
                                <MediaBadge type="quality" value={quality} />
                            </div>
                        )}

                        {/* IMDB Score */}
                        {imdbScore !== undefined && imdbScore !== null && (
                            <div className={styles['score-section']}>
                                <Icon className={styles['star-icon']} name="star" />
                                <span className={styles['score-value']}>
                                    {imdbScore}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Genres Badges */}
                {Array.isArray(genres) && genres.length > 0 && (
                    <div className={styles['genres-container']}>
                        {genres.slice(0, 3).map((genre, index) => (
                            <MediaBadge
                                key={index}
                                type="genre"
                                value={genre}
                            />
                        ))}
                        {genres.length > 3 && (
                            <span className={styles['more-genres']}>
                                +{genres.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Title Section */}
            {name && (
                <div className={styles['title-section']}>
                    <h3 className={styles['title']} title={name}>
                        {name}
                    </h3>
                </div>
            )}
        </div>
    );
});

EnhancedMetaItem.displayName = 'EnhancedMetaItem';

EnhancedMetaItem.propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    poster: PropTypes.string,
    posterShape: PropTypes.oneOf(['poster', 'landscape', 'square']),
    genres: PropTypes.arrayOf(PropTypes.string),
    quality: PropTypes.string,
    imdbScore: PropTypes.number,
    onPlayClick: PropTypes.func
};

module.exports = { EnhancedMetaItem, MediaBadge };
