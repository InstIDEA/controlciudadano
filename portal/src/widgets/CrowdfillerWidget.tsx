import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {message, Modal} from 'antd';

export function CrowdfillerWidget(props: {
    visible: boolean
    onComplete: () => void;
    onCancel: () => void;
    formId: number;
    defaultData?: unknown;
    src?: string;
}) {

    const iframe = useRef<HTMLIFrameElement>(null)
    const url = useMemo(() => {
        let base = `http://localhost:3000/form/${props.formId}?iframe=true`;
        if (props.src) {
            base += `&source=${props.src}`;
        }
        return base;
    }, [props.formId, props.src])

    function handleOk() {
        if (!iframe.current) return;
        console.log(`Firing CROWDFILLER_DO_SUBMIT`)
        iframe.current.contentWindow?.postMessage({
            __crowdfiller_evt_name: 'CROWDFILLER_DO_SUBMIT'
        } as FormIframeEvents, '*')
    }

    const messageHandler = useCallback((e: MessageEvent) => {
        console.log('CrowdfillerWidget received:', e)
        if (!e || !e.data) return;

        const data = e.data as FormIframeEvents;
        if (!data.__crowdfiller_evt_name) return;

        switch (data.__crowdfiller_evt_name) {
            case 'CROWDFILLER_DO_SUBMIT':
                break;
            case 'CROWDFILLER_SUBMITTED':
                message.info("Respuesta enviada! gracias por participar!");
                props.onComplete();
                break;
            case 'CROWDFILLER_VALIDATION_ERROR':
                message.warn("Errores en el formulario");
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler)
    }, [messageHandler])

    return <Modal
        title="Basic Modal"
        visible={props.visible}
        onOk={handleOk}
        style={{
            top: 20,
            height: '90vh'
        }}
        width="90vw"
        onCancel={props.onCancel}
    >
        <iframe src={url}
                ref={iframe}
                style={{
                    width: '100%',
                    height: '80vh'
                }}/>
    </Modal>

}


export type FormIframeEvents = {
    __crowdfiller_evt_name: 'CROWDFILLER_DO_SUBMIT'
} | {
    __crowdfiller_evt_name: 'CROWDFILLER_SUBMITTED',
    payload: {
        response: number
    }
} | {
    __crowdfiller_evt_name: 'CROWDFILLER_VALIDATION_ERROR',
    payload: {
        errors: unknown
    }
}
