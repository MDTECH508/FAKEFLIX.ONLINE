// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const QualitySelector = require('stremio/components/QualitySelector');
const SubtitleSelector = require('stremio/components/SubtitleSelector');
const styles = require('./styles');

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const VideoControls = React.memo(({
    className,
    isPlaying,
    duration,
    currentTime,
    quality,
    subtitle,
    availableSubtitles,
    volume,
    onPlayPauseClick,
    onQualityChange,
    onSubtitleChange,
    onFullscreenClick,
    onTimeChange,
    onVolumeChange,
    hidden,
    ...props
}) => {
    const [hoverProgress, setHoverProgress] = React.useState(null);
    const progressRef = React.useRef(null);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleProgressClick = React.useCallback((event) => {
        if (!progressRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const time = percent * duration;

        if (typeof onTimeChange === 'function') {
            onTimeChange(Math.max(0, Math.min(time, duration)));
        }
    }, [duration, onTimeChange]);

    const handleProgressHover = React.useCallback((event) => {
        if (!progressRef.current || !duration) {
            setHoverProgress(null);
            return;
        }

        const rect = progressRef.current.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        setHoverProgress(percent * 100);
    }, [duration]);

    return (
        <div
            className={classnames(
                className,
                styles['video-controls-container'],
                { [styles['hidden']]: hidden }
            )}
            {...props}
        >
            {/* Progress Bar */}
            <div
                ref={progressRef}
                className={styles['progress-container']}
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverProgress(null)}
                title={`Current time: ${formatTime(currentTime)}`}
            >
                <div
                    className={styles['progress-bar']}
                    style={{ width: `${progress}%` }}
                />
                {hoverProgress !== null && (
                    <div
                        className={styles['progress-hover']}
                        style={{ width: `${hoverProgress}%` }}
                    />
                )}
            </div>

            {/* Left Controls Group */}
            <div className={styles['controls-group left-group']}>
                {/* Play/Pause Button */}
                <button
                    className={styles['control-button']}
                    onClick={onPlayPauseClick}
                    title={isPlaying ? 'Pause' : 'Play'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <Icon
                        className={styles['icon']}
                        name={isPlaying ? 'pause' : 'play'}
                    />
                </button>

                {/* Volume Control */}
                <div className={styles['volume-container']}>
                    <button
                        className={styles['control-button']}
                        onClick={() => {
                            if (typeof onVolumeChange === 'function') {
                                onVolumeChange(volume === 0 ? 1 : 0);
                            }
                        }}
                        title={volume === 0 ? 'Unmute' : 'Mute'}
                        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    >
                        <Icon
                            className={styles['icon']}
                            name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
                        />
                    </button>
                    <input
                        type="range"
                        className={styles['volume-slider']}
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume || 0}
                        onChange={(e) => {
                            if (typeof onVolumeChange === 'function') {
                                onVolumeChange(parseFloat(e.target.value));
                            }
                        }}
                        title={`Volume: ${Math.round((volume || 0) * 100)}%`}
                        aria-label="Volume"
                    />
                </div>
            </div>

            {/* Time Display */}
            <div className={styles['controls-group time-group']}>
                <span>{formatTime(currentTime)}</span>
                <span> / </span>
                <span>{formatTime(duration)}</span>
            </div>

            {/* Right Controls Group */}
            <div className={styles['controls-group right-group']}>
                {/* Quality Selector */}
                {quality && (
                    <QualitySelector
                        currentQuality={quality}
                        onQualityChange={onQualityChange}
                    />
                )}

                {/* Subtitle Selector */}
                {subtitle && (
                    <SubtitleSelector
                        currentSubtitle={subtitle}
                        availableSubtitles={availableSubtitles}
                        onSubtitleChange={onSubtitleChange}
                    />
                )}

                {/* Fullscreen Button */}
                <button
                    className={styles['control-button']}
                    onClick={onFullscreenClick}
                    title="Fullscreen"
                    aria-label="Fullscreen"
                >
                    <Icon
                        className={styles['icon']}
                        name="fullscreen"
                    />
                </button>
            </div>
        </div>
    );
});

VideoControls.displayName = 'VideoControls';

VideoControls.propTypes = {
    className: PropTypes.string,
    isPlaying: PropTypes.bool,
    duration: PropTypes.number,
    currentTime: PropTypes.number,
    quality: PropTypes.string,
    subtitle: PropTypes.string,
    availableSubtitles: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string
    })),
    volume: PropTypes.number,
    onPlayPauseClick: PropTypes.func,
    onQualityChange: PropTypes.func,
    onSubtitleChange: PropTypes.func,
    onFullscreenClick: PropTypes.func,
    onTimeChange: PropTypes.func,
    onVolumeChange: PropTypes.func,
    hidden: PropTypes.bool
};

module.exports = VideoControls;
