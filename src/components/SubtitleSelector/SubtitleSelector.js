// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles');

const DEFAULT_SUBTITLES = [
    { value: 'off', label: 'Off' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ht', label: 'Kreyòl Ayisyen' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' }
];

const SubtitleSelector = React.memo(({
    className,
    currentSubtitle,
    availableSubtitles,
    onSubtitleChange,
    ...props
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef(null);

    // Merge provided subtitles with defaults
    const subtitles = React.useMemo(() => {
        if (Array.isArray(availableSubtitles) && availableSubtitles.length > 0) {
            return availableSubtitles;
        }
        return DEFAULT_SUBTITLES;
    }, [availableSubtitles]);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);

    const handleSubtitleSelect = React.useCallback((subtitle) => {
        if (typeof onSubtitleChange === 'function') {
            onSubtitleChange(subtitle);
        }
        setIsOpen(false);
    }, [onSubtitleChange]);

    const currentOption = subtitles.find(s => s.value === currentSubtitle) || subtitles[0];

    return (
        <div
            ref={menuRef}
            className={classnames(className, styles['subtitle-selector-container'])}
            {...props}
        >
            {/* Subtitle Button */}
            <button
                className={styles['subtitle-button']}
                onClick={() => setIsOpen(!isOpen)}
                title="Subtitles"
                aria-label="Subtitles"
                aria-expanded={isOpen}
            >
                <Icon
                    className={styles['icon']}
                    name="subtitles"
                />
                <span className={styles['label']}>
                    {currentOption.label}
                </span>
            </button>

            {/* Subtitle Menu */}
            {isOpen && (
                <div className={styles['subtitle-menu']}>
                    <div className={styles['menu-header']}>
                        <span className={styles['menu-title']}>Subtitles</span>
                    </div>

                    <div className={styles['menu-options']}>
                        {subtitles.map((option) => (
                            <button
                                key={option.value}
                                className={classnames(styles['menu-option'], {
                                    [styles['selected']]: option.value === currentSubtitle
                                })}
                                onClick={() => handleSubtitleSelect(option.value)}
                                title={option.label}
                            >
                                <span className={styles['option-label']}>
                                    {option.label}
                                </span>
                                {option.value === currentSubtitle && (
                                    <Icon
                                        className={styles['checkmark-icon']}
                                        name="checkmark"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className={styles['menu-footer']}>
                        <span className={styles['footer-text']}>
                            Language: {currentOption.label}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

SubtitleSelector.displayName = 'SubtitleSelector';

SubtitleSelector.propTypes = {
    className: PropTypes.string,
    currentSubtitle: PropTypes.string,
    availableSubtitles: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string
    })),
    onSubtitleChange: PropTypes.func
};

module.exports = SubtitleSelector;
