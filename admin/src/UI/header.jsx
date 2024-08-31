import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header = () => {
    return (
        <nav aria-label="Main navigation">
            <Link className="nav-button" to="/possession">Possession</Link>
            <Link className="nav-button" to="/patrimoine">Patrimoine</Link>
        </nav>
    );
};

export default Header;
