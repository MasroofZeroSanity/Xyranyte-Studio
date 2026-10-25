export type Align = 'left' | 'center' | 'right';
export type Overflow = 'shrink' | 'wrap';
export type Row = Record<string, unknown>;

export interface Anchor {
  id: string;
  /** xlsx column header this anchor reads from */
  column: string;
  /** anchor point, in image pixels */
  x: number;
  y: number;
  /** max text width, in image pixels */
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  color: string;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  align: Align;
  overflow: Overflow;
}

export interface RenderOptions {
  guides: boolean;
  selectedId: string | null;
}
