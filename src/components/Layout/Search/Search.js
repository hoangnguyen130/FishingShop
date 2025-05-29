import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Wrapper as PopperWrapper } from '~/components/Layout/Popper';
import { useDebounce } from '~/hooks';
import Tippy from '@tippyjs/react/headless';
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const debounced = useDebounce(searchValue, 700);
  const inputRef = useRef();

  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResult([]);
      return;
    }

    axios
      .get('http://localhost:3001/v1/products/search', {
        params: {
          q: debounced,
        },
      })
      .then((res) => {
        setSearchResult(res.data.data || []);
        setShowResult(true);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
        setSearchResult([]);
      });
  }, [debounced]);

  const handleClear = () => {
    setSearchValue('');
    setSearchResult([]);
    setShowResult(false);
    inputRef.current.focus();
  };

  const handleHideResult = () => {
    setShowResult(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      console.log(searchValue.trim());
      setShowResult(false);
    }
  };

  return (
    <Tippy
      interactive
      visible={showResult && searchResult.length > 0}
      render={(attrs) => (
        <div
          className="w-96 bg-white shadow-lg rounded-md mt-2 p-2 max-h-96 overflow-y-auto"
          tabIndex="-1"
          {...attrs}
        >
          <PopperWrapper>
            {searchResult.map((item) => (
              <ProductItem key={item._id} data={item} />
            ))}
          </PopperWrapper>
        </div>
      )}
      onClickOutside={handleHideResult}
    >
      <div className="relative w-full max-w-md">
        <input
          ref={inputRef}
          value={searchValue}
          className="w-full p-2 pl-10 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          spellCheck={false}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setShowResult(true)}
          onKeyDown={handleSearch}
          aria-label="Tìm kiếm sản phẩm"
        />
        {!!searchValue && (
          <button
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={handleClear}
          >
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        )}
        <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
      </div>
    </Tippy>
  );
}

export default Search;