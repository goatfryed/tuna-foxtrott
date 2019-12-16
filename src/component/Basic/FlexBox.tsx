import styled from "styled-components";


export const FlexColumnCentered = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-evenly;
`;

export const FlexRowCentered = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
`;

export const Row = styled.div`
  display: flex;
  justify-content: center;
`;

export const ContentFittedDiv = styled.div`
    width: fit-content;
    height: fit-content;
`;