import React from "react";
import { FaUndoAlt, FaSearch } from "react-icons/fa";
import styles from './SearchBar.module.css';

const SearchBar = ({ keyword, onKeywordChange, onSearch, onReset, children }) => (
  <form className={styles.searchBar} onSubmit={e => { e.preventDefault(); onSearch && onSearch(); }}>
    <div className={styles.filters}>
      {children}
    </div>
    <div className={styles.main}>
      <input
        className={styles.input}
        type="text"
        placeholder="검색어를 입력하세요"
        value={keyword}
        onChange={e => onKeywordChange(e.target.value)}
      />
      <button
        className={`${styles.btn} ${styles.btnReset}`}
        type="button"
        onClick={onReset}
        title="초기화"
      >
        <FaUndoAlt />
      </button>
      <button
        className={`${styles.btn} ${styles.btnSubmit}`}
        type="submit"
      >
        <FaSearch />
        <span>검색</span>
      </button>
    </div>
  </form>
);

export default SearchBar; 