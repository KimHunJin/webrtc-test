import React from "react"

interface Props {
    onChange: (value: string) => void
    value: string
}

export const Input = ({ onChange, value}: Props) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    return <input type="text" value={value} onChange={handleChange}/>
}