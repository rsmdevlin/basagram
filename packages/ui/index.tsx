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

// Icon components
export const SearchIcon = (props: any) => <span {...props}>🔍</span>;
export const AttachIcon = (props: any) => <span {...props}>📎</span>;
export const EmojiIcon = (props: any) => <span {...props}>😊</span>;
export const SendIcon = (props: any) => <span {...props}>➤</span>;
export const PhoneIcon = (props: any) => <span {...props}>☎️</span>;
export const CameraIcon = (props: any) => <span {...props}>📷</span>;
export const MicrophoneIcon = (props: any) => <span {...props}>🎙️</span>;
export const CloseIcon = (props: any) => <span {...props}>✕</span>;
export const CallIcon = (props: any) => <span {...props}>📞</span>;
export const MoreIcon = (props: any) => <span {...props}>⋯</span>;
export const MenuIcon = (props: any) => <span {...props}>☰</span>;
export const BackIcon = (props: any) => <span {...props}>←</span>;
export const CheckIcon = (props: any) => <span {...props}>✓</span>;

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
  SearchIcon,
  AttachIcon,
  EmojiIcon,
  SendIcon,
  PhoneIcon,
  CameraIcon,
  MicrophoneIcon,
  CloseIcon,
  CallIcon,
  MoreIcon,
  MenuIcon,
};
