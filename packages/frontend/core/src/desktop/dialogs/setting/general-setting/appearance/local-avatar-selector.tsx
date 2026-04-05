import { Avatar } from '@affine/component/ui/avatar';
import { useI18n } from '@affine/i18n';
import clsx from 'clsx';
import { useCallback } from 'react';

import * as styles from './local-avatar-selector.css';

import hamster from '../../../../../assets/avatars/仓鼠.png';
import psyduck from '../../../../../assets/avatars/可达鸭.png';
import husky from '../../../../../assets/avatars/哈士奇.png';
import ragdoll from '../../../../../assets/avatars/布偶猫.png';
import sphynx from '../../../../../assets/avatars/无毛猫.png';
import orangeCat from '../../../../../assets/avatars/橘猫.png';
import frenchBulldog from '../../../../../assets/avatars/法斗.png';
import whiteCat from '../../../../../assets/avatars/白猫.png';
import guineaPig from '../../../../../assets/avatars/荷兰猪.png';
import goldenRetriever from '../../../../../assets/avatars/金毛.png';
import blackCat from '../../../../../assets/avatars/黑猫.png';
import tibetanMastiff from '../../../../../assets/avatars/藏獒.png';

const avatarList = [
  { name: '仓鼠', url: hamster },
  { name: '可达鸭', url: psyduck },
  { name: '哈士奇', url: husky },
  { name: '布偶猫', url: ragdoll },
  { name: '无毛猫', url: sphynx },
  { name: '橘猫', url: orangeCat },
  { name: '法斗', url: frenchBulldog },
  { name: '白猫', url: whiteCat },
  { name: '荷兰猪', url: guineaPig },
  { name: '金毛', url: goldenRetriever },
  { name: '黑猫', url: blackCat },
  { name: '藏獒', url: tibetanMastiff },
];

interface LocalAvatarSelectorProps {
  selectedAvatar: string | null;
  onChange: (avatar: string | null) => void;
}

export const LocalAvatarSelector = ({
  selectedAvatar,
  onChange,
}: LocalAvatarSelectorProps) => {
  const t = useI18n();

  const handleSelect = useCallback(
    (avatarUrl: string) => {
      onChange(selectedAvatar === avatarUrl ? null : avatarUrl);
    },
    [onChange, selectedAvatar]
  );

  return (
    <div className={styles.avatarSelectorWrapper}>
      <div className={styles.avatarGrid}>
        {avatarList.map(avatar => (
          <img
            key={avatar.name}
            src={avatar.url}
            alt={avatar.name}
            className={clsx(styles.avatarItem, {
              [styles.avatarItemSelected]: selectedAvatar === avatar.url,
            })}
            onClick={() => handleSelect(avatar.url)}
          />
        ))}
      </div>
    </div>
  );
};

export const LocalUserAvatarPreview = ({
  avatarUrl,
  size = 56,
}: {
  avatarUrl: string | null;
  size?: number;
}) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Local user avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    );
  }
  return <Avatar size={size} name="Local User" />;
};
