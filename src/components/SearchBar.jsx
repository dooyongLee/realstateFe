import React from "react";

const SearchBar = ({ keyword, onKeywordChange, onSearch, children }) => (
  <form className="search-bar" onSubmit={e => { e.preventDefault(); onSearch && onSearch(); }}>
    <input
      className="search-bar-input"
      type="text"
      placeholder="검색어를 입력하세요"
      value={keyword}
      onChange={e => onKeywordChange(e.target.value)}
    />
    {children}
    <button className="search-bar-btn" type="submit">검색</button>
  </form>
);

export default SearchBar; 