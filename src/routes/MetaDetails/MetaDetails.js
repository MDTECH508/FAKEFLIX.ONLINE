// Copyright (C) 2017-2024 Smart code 203358507

const React = require('react');
const { useTranslation } = reactI18next;
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { withCoreSuspender } = require('stremio/common');
const { HorizontalNavBar, DelayedRenderer, Image, MetaPreview, Button } = require('stremio/components');
const CustomMetaPanel = require('./CustomMetaPanel');
const useMetaDetails = require('./useMetaDetails');
const styles = require('./styles');

const MetaDetails = ({ urlParams, queryParams }) => {
    const { t } = useTranslation();
    const [retryCount, setRetryCount] = React.useState(0);
    const metaDetails = useMetaDetails(urlParams, retryCount);
    const [metaPath, streamPath] = React.useMemo(() => {
        return metaDetails.selected !== null ?
            [metaDetails.selected.metaPath, metaDetails.selected.streamPath]
            :
            [null, null];
    }, [metaDetails.selected]);

    const renderBackgroundImageFallback = React.useCallback(() => null, []);
    const renderBackground = React.useMemo(() => !!(
        metaPath &&
        metaDetails?.metaItem &&
        metaDetails.metaItem.content.type !== 'Loading' &&
        typeof metaDetails.metaItem.content.content?.background === 'string' &&
        metaDetails.metaItem.content.content.background.length > 0
    ), [metaPath, metaDetails]);

    // Fonction pour réessayer le chargement
    const handleRetry = React.useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

    // Fonction pour naviguer vers l'accueil
    const handleGoHome = React.useCallback(() => {
        window.location.href = '/';
    }, []);

    // Fonction pour naviguer vers le catalogue
    const handleGoToCatalog = React.useCallback(() => {
        window.location.href = `/catalog/${urlParams?.type || 'movie'}`;
    }, [urlParams?.type]);

    // Composant d'erreur amélioré
    const ErrorDisplay = ({ title, message, showRetry = true, showHome = true, showCatalog = true }) => (
        <div className={styles['error-container']}>
            <div className={styles['error-content']}>
                <div className={styles['error-icon']}>
                    <Image 
                        className={styles['error-image']} 
                        src={require('/assets/images/empty.png')} 
                        alt={' '} 
                    />
                </div>
                <div className={styles['error-title']}>{title || t('META_NOT_FOUND')}</div>
                <div className={styles['error-message']}>{message || t('ERR_NO_META_FOUND')}</div>
                <div className={styles['error-actions']}>
                    {showRetry && (
                        <Button 
                            className={styles['error-button']}
                            onClick={handleRetry}
                            title={t('RETRY')}
                        >
                            <span>{t('RETRY')}</span>
                        </Button>
                    )}
                    {showCatalog && (
                        <Button 
                            className={classnames(styles['error-button'], styles['secondary'])}
                            onClick={handleGoToCatalog}
                            title={t('BROWSE_CATALOG')}
                        >
                            <span>{t('BROWSE_CATALOG')}</span>
                        </Button>
                    )}
                    {showHome && (
                        <Button 
                            className={classnames(styles['error-button'], styles['outline'])}
                            onClick={handleGoHome}
                            title={t('GO_HOME')}
                        >
                            <span>{t('GO_HOME')}</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    // Vérification spécifique pour les paramètres invalides
    const isValidUrlParams = React.useMemo(() => {
        if (!urlParams) return false;
        const { type, id } = urlParams;
        if (!type || !id) return false;
        if (typeof type !== 'string' || typeof id !== 'string') return false;
        if (type.trim().length === 0 || id.trim().length === 0) return false;
        return true;
    }, [urlParams]);

    // Vérifier si le chargement a échoué avec une erreur spécifique
    const hasLoadError = React.useMemo(() => {
        if (metaDetails.metaItem?.content?.type === 'Err') {
            const errorMessage = metaDetails.metaItem.content.message || '';
            // Détecter les erreurs de métadonnées
            if (errorMessage.includes('404') || 
                errorMessage.includes('not found') || 
                errorMessage.includes('meta') ||
                metaDetails.metaItem.content.content === null) {
                return true;
            }
        }
        return false;
    }, [metaDetails.metaItem]);

    const renderDetailsContent = () => {
        // Cas 1: Pas de paramètres valides
        if (!isValidUrlParams) {
            return (
                <ErrorDisplay 
                    title={t('INVALID_URL')}
                    message={t('ERR_INVALID_PARAMETERS')}
                    showRetry={false}
                />
            );
        }

        // Cas 2: Pas de metaPath sélectionné
        if (metaPath === null && metaDetails.selected === null) {
            return (
                <DelayedRenderer delay={500}>
                    <ErrorDisplay 
                        title={t('NO_META_SELECTED')}
                        message={t('ERR_NO_META_SELECTED')}
                        showRetry={true}
                    />
                </DelayedRenderer>
            );
        }

        // Cas 3: Chargement en cours
        if (metaDetails.metaItem === null || metaDetails.metaItem.content.type === 'Loading') {
            return (
                <div className={styles['loading-container']}>
                    <MetaPreview.Placeholder className={styles['custom-meta-panel']} />
                    <div className={styles['loading-overlay']}>
                        <div className={styles['spinner']} />
                        <span>{t('LOADING_METADATA')}</span>
                    </div>
                </div>
            );
        }

        // Cas 4: Erreur de métadonnées
        if (hasLoadError || metaDetails.metaItem.content.type === 'Err') {
            const errorMessage = metaDetails.metaItem.content.message || t('ERR_NO_META_FOUND');
            const isNotFound = errorMessage.toLowerCase().includes('not found') || 
                              errorMessage.toLowerCase().includes('404');
            
            return (
                <ErrorDisplay 
                    title={isNotFound ? t('META_NOT_FOUND') : t('LOADING_ERROR')}
                    message={isNotFound ? t('ERR_NO_META_FOUND_DETAILED', { id: urlParams?.id, type: urlParams?.type }) : errorMessage}
                    showRetry={true}
                    showCatalog={true}
                    showHome={true}
                />
            );
        }

        // Cas 5: Succès - afficher les détails
        const metaContent = metaDetails.metaItem.content.content;
        
        // Vérification supplémentaire que le contenu existe
        if (!metaContent || !metaContent.name) {
            return (
                <ErrorDisplay 
                    title={t('INCOMPLETE_DATA')}
                    message={t('ERR_INCOMPLETE_METADATA')}
                    showRetry={true}
                />
            );
        }

        return (
            <CustomMetaPanel
                className={classnames(styles['custom-meta-panel'], 'animation-fade-in')}
                meta={metaContent}
                customInfo={metaDetails.customInfo}
                streams={metaDetails.streams}
                type={urlParams.type}
                streamPath={streamPath}
                libraryItem={metaDetails.libraryItem}
                onError={handleRetry}
            />
        );
    };

    return (
        <div className={styles['metadetails-container']}>
            {renderBackground && (
                <div className={styles['background-image-layer']}>
                    <Image
                        className={styles['background-image']}
                        src={metaDetails.metaItem.content.content.background}
                        renderFallback={renderBackgroundImageFallback}
                        alt={' '}
                        onError={() => console.warn('Background image failed to load')}
                    />
                    <div className={styles['background-overlay']} />
                </div>
            )}
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
                fullscreenButton={true}
                navMenu={true}
            />
            <div className={styles['metadetails-content']}>
                {renderDetailsContent()}
            </div>
        </div>
    );
};

MetaDetails.propTypes = {
    urlParams: PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        videoId: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const MetaDetailsFallback = () => (
    <div className={styles['metadetails-container']}>
        <HorizontalNavBar
            className={styles['nav-bar']}
            backButton={true}
            fullscreenButton={true}
            navMenu={true}
        />
        <div className={styles['fallback-container']}>
            <div className={styles['spinner']} />
            <span>{t('LOADING')}</span>
        </div>
    </div>
);

module.exports = withCoreSuspender(MetaDetails, MetaDetailsFallback);
