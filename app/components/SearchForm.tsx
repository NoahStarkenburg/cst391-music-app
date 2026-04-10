'use client';

import { useState } from 'react';

interface SearchFormProps {
    onSubmit: (phrase: string) => void;
}

const SearchForm = (props: SearchFormProps) => {
    const [inputText, setInputText] = useState("");

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
        console.log(inputText);
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        props.onSubmit(inputText);
    };

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <div className='form-group'>
                    <label htmlFor='search-term'>Search for</label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder='Enter search term here'
                        onChange={handleChangeInput}
                    />
                </div>
            </form>
        </div>
    );
};

export default SearchForm;
