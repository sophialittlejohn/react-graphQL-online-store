import ResetPassword from '../components/ResetPassword';

const reset = props => <ResetPassword resetToken={props.query.resetToken} />;

export default reset;
