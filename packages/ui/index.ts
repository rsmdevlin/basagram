// Stub UI components
export const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

export const Input = (props: any) => <input {...props} />;

export const Select = ({ children, ...props }: any) => (
  <select {...props}>{children}</select>
);

export const Option = ({ children, ...props }: any) => (
  <option {...props}>{children}</option>
);

export const Modal = ({ children, isOpen, ...props }: any) =>
  isOpen ? <div {...props}>{children}</div> : null;

export const Card = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const Badge = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
);

export const Avatar = ({ src, alt, ...props }: any) => (
  <img src={src} alt={alt} {...props} />
);

export const Spinner = (props: any) => <div {...props}>Loading...</div>;

export const Toast = ({ message, type }: any) => (
  <div className={`toast toast-${type}`}>{message}</div>
);

export default {
  Button,
  Input,
  Select,
  Option,
  Modal,
  Card,
  Badge,
  Avatar,
  Spinner,
  Toast,
};
