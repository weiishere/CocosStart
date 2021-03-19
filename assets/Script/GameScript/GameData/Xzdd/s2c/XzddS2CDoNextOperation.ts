import { XzddAzimuth } from './XzddAzimuth';
import { XzddNextStep } from './XzddNextStep';
export class XzddS2CDoNextOperation extends XzddAzimuth {
    nextStep: XzddNextStep;
    reContinueMessage: boolean;
}