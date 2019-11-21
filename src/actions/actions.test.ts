import {Board, PlayerUnit} from "../model";
import {computePath} from "./actions";


describe("Pathfinding", () => {
    /**
     * O O O O O
     * O E E O O
     * O O O E O
     * O O O E O
     * O O O E O
     */
    function getBoard() {
        const board = new Board(5,5);
        board.getCell(1,1).unit = {} as PlayerUnit;
        board.getCell(2,1).unit = {} as PlayerUnit;
        board.getCell(3,2).unit = {} as PlayerUnit;
        board.getCell(3,3).unit = {} as PlayerUnit;
        board.getCell(3,4).unit = {} as PlayerUnit;
        return board;

    }
    test("it should find a direct path", () => {
        const board = getBoard();
        const start = board.getCell(0,0);
        const end = board.getCell(3,0);

        const actual = computePath(board, start, end);
        expect(actual).toMatchObject({
            steps: expect.arrayContaining([start, end]),
            cost: 3,
        });
    });
});