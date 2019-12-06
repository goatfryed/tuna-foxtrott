import {Player} from "../../model";
import {NotNull} from "../../helpers";
import {Board, createBoard, OBSTACLE} from "../../model/board";
import {IngameUnit} from "../../model/IngameUnit";
import {computePath} from "../pathfinder";


describe("Pathfinding", () => {
    /**
     * O O O O O
     * O X X O O
     * O O O X O
     * O O O X O
     * O O O X O
     */
    const karli = new Player("bob");

    function getBoard() {
        return createBoard(5, 5,
            [
                {
                    terrain: OBSTACLE,
                    x: 1, y: 1,
                },
                {
                    terrain: OBSTACLE,
                    x: 2, y: 1,
                },
                {
                    terrain: OBSTACLE,
                    x: 3, y: 2,
                },
                {
                    terrain: OBSTACLE,
                    x: 3, y: 3,
                },
                {
                    terrain: OBSTACLE,
                    x: 3, y: 4,
                },
            ]
        );
    }

    test("it should find a direct path", () => {
        const board = getBoard();
        testDirectPath(board);
    });

    test( "it should find a way around", () => {
        const board = getBoard();
        const start = board.getCell(0,4);
        const end = board.getCell(4,4);
        const unit = {player: karli, cell: start} as NotNull<IngameUnit,"cell">;

        const actual = computePath(board, unit, end);
        expect(actual).toMatchObject({
            steps: expect.arrayContaining([start, end]),
            cost: 12,
        });
    });

    test( "it should be blocked by units", () => {
        const board = getBoard();
        const start = board.getCell(0,0);
        const end = board.getCell(3,0);
        board.getCell(2,0).unit = {isCombatReady: true} as IngameUnit;
        const unit = {player: karli, cell: start} as NotNull<IngameUnit,"cell">;

        const actual = computePath(board, unit, end);
        expect(actual).toBeNull();
    });

    test( "it shouldn't be blocked by dead units", () => {
        const board = getBoard();
        board.getCell(2,0).unit = {isCombatReady: false} as IngameUnit;
        testDirectPath(board);
    });

    function testDirectPath(board: Board) {
        const start = board.getCell(0, 0);
        const end = board.getCell(3, 0);
        const unit = {player: karli, cell: start} as NotNull<IngameUnit, "cell">;

        const expectedPath = [
            start,
            board.getCell(1, 0),
            board.getCell(2, 0),
            end,
        ];

        const actual = computePath(board, unit, end);
        expect(actual).toMatchObject({
            steps: expectedPath,
            cost: 3,
        });
    }

    test( "it should allow passing allies", () => {
        const board = getBoard();
        board.getCell(1,0).unit = {player: karli} as IngameUnit;
        testDirectPath(board);
    })
});