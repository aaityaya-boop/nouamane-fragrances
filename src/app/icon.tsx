import { ImageResponse } from 'next/og';
 
// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 100,
          fontWeight: 700,
        }}
      >
        NAY
      </div>
    ),
    {
      ...size,
    }
  );
}
