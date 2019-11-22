import {Board, Player, PlayerUnit} from "../model";
import {computePath} from "./actions";
import {NotNull} from "../helpers";


describe("Pathfinding", () => {
    /**
     * O O O O O
     * O E E O O
     * O O O E O
     * O O O E O
     * O O O E O
     */
    const karli = new Player("bob");

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
        testDirectPath(board);
    });

    test( "it should find a way around", () => {
        const board = getBoard();
        const start = board.getCell(0,4);
        const end = board.getCell(4,4);
        const unit = {player: karli, cell: start} as NotNull<PlayerUnit,"cell">;

        const actual = computePath(unit, board, end);
        expect(actual).toMatchObject({
            steps: expect.arrayContaining([start, end]),
            cost: 12,
        });
    });

    test( "it should return null, if no path available", () => {
        const board = getBoard();
        const start = board.getCell(0,0);
        const end = board.getCell(3,0);
        board.getCell(2,0).unit = {} as PlayerUnit;
        const unit = {player: karli, cell: start} as NotNull<PlayerUnit,"cell">;

        const actual = computePath(unit, board, end);
        expect(actual).toBeNull();
    });

    function testDirectPath(board: Board) {
        const start = board.getCell(0, 0);
        const end = board.getCell(3, 0);
        const unit = {player: karli, cell: start} as NotNull<PlayerUnit, "cell">;

        const expectedPath = [
            start,
            board.getCell(1, 0),
            board.getCell(2, 0),
            end,
        ];

        const actual = computePath(unit, board, end);
        expect(actual).toMatchObject({
            steps: expectedPath,
            cost: 3,
        });
    }

    test( "it should allow passing allies", () => {
        const board = getBoard();
        board.getCell(1,0).unit = {player: karli} as PlayerUnit;
        testDirectPath(board);
    })
});