import classNames from "classnames/bind";
import Tippy from "@tippyjs/react/headless";
import { Wrapper as PopperWrapper } from "~/component/Layout/Popper";
import styles from "./Menu.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);


function Menu( {children}) {
    const navigate = useNavigate()

    const handleSignOut = () => {
        localStorage.removeItem('token')
        navigate('/sign-in')
    }
    return ( 
        <Tippy
            placement='bottom-end'
            interactive
            // visible
            render = {attrs => (
                <div className={cx('menu-user')} tabIndex='-1' {...attrs}>
                    <button className={cx('menu-items')}>
                        <PopperWrapper>
                            <FontAwesomeIcon icon={faUser}/>
                            <p className={cx('text')}>Account</p>
                        </PopperWrapper>
                    </button>
                    <button className={cx('menu-items')}>
                        <PopperWrapper>
                            <FontAwesomeIcon icon={faCircleQuestion}/>
                            <p className={cx('text')}>Get help</p>
                        </PopperWrapper>
                    </button>
                    <button className={cx('menu-items')}>
                        <PopperWrapper>
                            <FontAwesomeIcon icon={faSignOut}/>
                            <p className={cx('text')} onClick={handleSignOut}>Sign out</p>
                        </PopperWrapper>   
                    </button>  
                </div>
            )}
        >
        {children}
        </Tippy>
     );
}

export default Menu;