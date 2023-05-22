import React from "react"

interface Props {
    onClick: () => void
}

export const JoinButton = ({onClick}: Props) => {
    return (
        <button onClick={onClick}>
            Join in Room
        </button>
    )
}