import React, {useMemo} from "react";
import {IngameUnit} from "../model/IngameUnit";

interface HeroDetailProps extends HeroAware {
    onClick?: (hero: IngameUnit) => any,
    style?: string,
}

export interface HeroAware {
    hero: IngameUnit,
}
export function HeroDetail({hero, onClick, style = "is-info"}: HeroDetailProps) {

    const handleClick = useMemo(
        () => onClick && ((e: React.MouseEvent<HTMLElement>) => {
            onClick(hero);
            e.currentTarget.blur();
            return false;
        }),
        [hero, onClick]
    );

    return <div className="unit-entry">
        <button tabIndex={-1}
            className={"button is-small " + style}
            onClick={handleClick}
            disabled={!handleClick}
        >{hero.name}</button>
    </div>;
}