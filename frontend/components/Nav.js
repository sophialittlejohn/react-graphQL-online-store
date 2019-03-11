import Link from 'next/link';
import NavStyles from './styles/NavStyles';

const Nav = () => (
  <div>
    <Link href="/">
      <a>Home</a>
  <NavStyles>
    </Link>
    <Link href="/sell">
      <a>Sell Something!</a>
    </Link>
  </div>
  </NavStyles>
);

export default Nav;
