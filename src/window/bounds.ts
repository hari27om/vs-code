import { WindowBoundsPayload } from "../ipc/messages";

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayLike {
  id?: string | number;
  scaleFactor?: number;
}

export interface WindowStateLike {
  isMinimized?: boolean;
  isFullScreen?: boolean;
}

export function normalizeWindowBounds(
  bounds: Partial<RectLike> | null | undefined,
  display: DisplayLike | null | undefined,
  state: WindowStateLike | null | undefined
): WindowBoundsPayload {
  const safeBounds = {
    x: typeof bounds?.x === "number" && Number.isFinite(bounds.x) ? bounds.x : 0,
    y: typeof bounds?.y === "number" && Number.isFinite(bounds.y) ? bounds.y : 0,
    width:
      typeof bounds?.width === "number" && Number.isFinite(bounds.width) ? bounds.width : 0,
    height:
      typeof bounds?.height === "number" && Number.isFinite(bounds.height) ? bounds.height : 0,
  };

  const displayId =
    typeof display?.id === "number" || typeof display?.id === "string"
      ? display.id
      : 0;

  const dpiScale =
    typeof display?.scaleFactor === "number" && Number.isFinite(display.scaleFactor)
      ? display.scaleFactor
      : 1;

  return {
    x: safeBounds.x,
    y: safeBounds.y,
    width: safeBounds.width,
    height: safeBounds.height,
    displayId,
    dpiScale,
    isMinimized: Boolean(state?.isMinimized),
    isFullScreen: Boolean(state?.isFullScreen),
  };
}
