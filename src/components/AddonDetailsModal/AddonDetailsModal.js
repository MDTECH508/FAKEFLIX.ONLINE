const AddonDetailsModal = ({ transportUrl, onCloseRequest }) => {
    const { t } = useTranslation();
    const addonDetails = useAddonDetails(transportUrl);

    const modalButtons = [
        { label: t('CLOSE'), onClick: onCloseRequest, style: 'secondary' }
    ];

    const modalBackground = addonDetails.remoteAddon?.content?.content?.manifest?.background ?? null;

    // Fonksyon pou chwazi kontni an selon eta chajman
    const renderContent = () => {
        const { selected, remoteAddon, localAddon } = addonDetails;

        if (selected === null) {
            return <div className={styles['addon-details-message-container']}>
                {t('ADDON_LOADING_MANIFEST')}
            </div>;
        }

        if (remoteAddon === null || remoteAddon.content.type === 'Loading') {
            return <div className={styles['addon-details-message-container']}>
                {t('ADDON_LOADING_MANIFEST_FROM', { origin: selected.transportUrl })}
            </div>;
        }

        if (remoteAddon.content.type === 'Err' && localAddon === null) {
            return <div className={styles['addon-details-message-container']}>
                {t('ADDON_LOADING_MANIFEST_FAILED', { origin: selected.transportUrl })}
                <div>{remoteAddon.content.content.message}</div>
            </div>;
        }

        return <AddonDetailsWithRemoteAndLocalAddon
            className={styles['addon-details-container']}
            remoteAddon={remoteAddon}
            localAddon={localAddon}
        />;
    };

    return (
        <ModalDialog
            className={styles['addon-details-modal-container']}
            title={t('STREMIO_COMMUNITY_ADDON')}
            buttons={modalButtons}
            background={modalBackground}
            onCloseRequest={onCloseRequest}
        >
            {renderContent()}
        </ModalDialog>
    );
};

AddonDetailsModal.propTypes = {
    transportUrl: PropTypes.string,
    onCloseRequest: PropTypes.func
};

const AddonDetailsModalFallback = ({ onCloseRequest }) => {
    const { t } = useTranslation();
    return (
        <ModalDialog
            className={styles['addon-details-modal-container']}
            title={t('STREMIO_COMMUNITY_ADDON')}
            onCloseRequest={onCloseRequest}
        >
            <div className={styles['addon-details-message-container']}>
                {t('ADDON_LOADING_MANIFEST')}
            </div>
        </ModalDialog>
    );
};

AddonDetailsModalFallback.propTypes = AddonDetailsModal.propTypes;

module.exports = withCoreSuspender(AddonDetailsModal, AddonDetailsModalFallback);
