import React, { useState } from 'react';
import VideoControls from 'stremio/components/VideoControls';
import { EnhancedMetaItem } from 'stremio/components/EnhancedMetaItem';

const MoviePlayer = ({ movie }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [quality, setQuality] = useState('720p');
    const [subtitle, setSubtitle] = useState('en');

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Movie Info */}
            <EnhancedMetaItem
                name={movie.title}
                genres={movie.genres}
                quality={quality}
                poster={movie.poster}
                imdbScore={movie.imdbScore}
                onPlayClick={() => setIsPlaying(true)}
            />

            {/* Video Player Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                backgroundColor: '#000',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                marginTop: '1rem'
            }}>
                <video
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    playing={isPlaying}
                    src={movie.videoUrl}
                />

                {/* Player Controls */}
                <VideoControls
                    isPlaying={isPlaying}
                    duration={movie.duration}
                    currentTime={currentTime}
                    quality={quality}
                    subtitle={subtitle}
                    availableSubtitles={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Español' },
                        { value: 'ht', label: 'Kreyòl' }
                    ]}
                    onPlayPauseClick={() => setIsPlaying(!isPlaying)}
                    onQualityChange={setQuality}
                    onSubtitleChange={setSubtitle}
                    onFullscreenClick={() => {/* Handle fullscreen */}}
                    onTimeChange={setCurrentTime}
                />
            </div>
        </div>
    );
};

export default MoviePlayer;
