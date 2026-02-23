import styled from 'styled-components';

export const MapWrapper = styled.div`
  position: relative;
  height: 100%;
`;

export const MapContainer = styled.div`
  position: absolute;
  inset: 0;
`;

export const Tooltip = styled.div`
  position: absolute;
  display: none;
  pointer-events: none;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 10px;
  max-width: 360px;
  font-size: 12px;
  white-space: pre-wrap;
`;
