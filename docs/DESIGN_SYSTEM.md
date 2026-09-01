# Design System — Basagram Aurora

## Цветовая палитра

### Primary Colors (Aurora)
- 50-900: От светлого к темному оттенкам синего
- Основной цвет: #5865ff (Primary-500)

### Neutral Colors (Deep Space)
- 0-950: От белого к почти черному
- Фон приложения: #0f1419 (Neutral-950)
- Вторичный фон: #1a1d23 (Neutral-900)

### Семантические цвета
- Success: #10b981 (зеленый)
- Warning: #f59e0b (оранжевый)
- Error: #ef4444 (красный)
- Info: #3b82f6 (синий)

## Типография

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Font Mono**: SFMono, Consolas, Liberation Mono

### Размеры текста
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px (medium weight)
- xl: 20px (semibold)
- 2xl: 24px (semibold)
- 3xl: 30px (bold)
- 4xl: 36px (bold)

## Spacing Scale

- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px

## Border Radius

- none: 0
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 20px
- full: 9999px

## Shadow System

- xs: Минимальная тень
- sm: Легкая тень
- md: Средняя тень
- lg: Большая тень
- xl: Очень большая тень
- glass: Эффект стекла (0 8px 32px rgba(31, 38, 135, 0.15))

## Компоненты

### Button
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- States: active, disabled, loading

### Input
- Full width по умолчанию
- Focus ring: 2px primary-500
- Error state поддержан

### Card
- Темный фон с borderm
- Padding: 1rem (по умолчанию)

### Avatar
- Sizes: sm (8x8), md (10x10), lg (12x12), xl (16x16)
- Fallback: первая буква имени

### Badge
- Variants: primary, success, error, warning
- Компактный размер

## Animations

- fade-in: 300ms ease-in-out
- slide-in: 300ms ease-in-out (от низу)
- slide-in-left: 300ms ease-in-out (от слева)

## Icon System

Собственная SVG иконография:
- SendIcon
- AttachIcon
- SearchIcon
- SettingsIcon
- ProfileIcon
- CallIcon
- CameraIcon
- MicrophoneIcon
- EmojiIcon
- MoreIcon
- CloseIcon
- BackIcon
- MenuIcon
- CheckIcon

## Использование

### В React компонентах
```tsx
import { Button, Input, Card, Avatar, Badge } from '@basagram/ui';
import { SendIcon, SearchIcon } from '@basagram/ui';

export function Example() {
  return (
    <Card>
      <Input label="Поиск" placeholder="Введите сообщение..." />
      <Button variant="primary">
        <SendIcon size={20} />
        Отправить
      </Button>
    </Card>
  );
}
```

### CSS Классы
```html
<button class="btn btn-primary">Отправить</button>
<input class="input" placeholder="Введите сообщение..." />
<div class="card card-lg">Содержимое</div>
<span class="badge badge-primary">Новое</span>
```

## Темы

Dark mode установлен по умолчанию. Все компоненты оптимизированы для темного интерфейса.

## Доступность

- Focus visible для всех интерактивных элементов
- Достаточная контрастность текста
- Семантический HTML
- ARIA labels на значимых элементах
