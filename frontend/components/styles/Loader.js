import styled, { keyframes } from 'styled-components';

const loading = keyframes`
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
`;

const Loader = styled.div`
  height: 100px;
  opacity: 1;
  position: relative;
  transition: opacity linear 0.1s;

  &:before {
    animation: 2s linear infinite ${loading};
    border: solid 3px #eee;
    border-bottom-color: #e8be37;
    border-radius: 50%;
    content: '';
    height: 50px;
    left: 50%;
    opacity: inherit;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center;
    width: 50px;
    will-change: transform;
  }
`;

export default Loader;
