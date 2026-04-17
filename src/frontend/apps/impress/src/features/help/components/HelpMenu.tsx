import {
  Button,
  ButtonProps,
  useModal,
} from '@gouvfr-lasuite/cunningham-react';
import { DropdownMenu } from '@gouvfr-lasuite/ui-kit';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import BubbleTextIcon from '@/assets/icons/ui-kit/bubble-text.svg';
import HelpIcon from '@/assets/icons/ui-kit/question-mark.svg';
import WandAndStarsIcon from '@/assets/icons/ui-kit/wand-and-stars.svg';
import { Box, DropdownMenuOption } from '@/components';
import { useConfig } from '@/core';
import { openCrispChat } from '@/services';

import { OnBoarding } from './OnBoarding';

export const HelpMenu = ({
  colorButton,
}: {
  colorButton?: ButtonProps['color'];
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const modalOnbording = useModal();
  const { data: config } = useConfig();
  const onboardingEnabled = config?.theme_customization?.onboarding?.enabled;
  const crispEnabled = !!config?.CRISP_WEBSITE_ID;

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  const options = useMemo<DropdownMenuOption[]>(
    () => [
      {
        label: t('Get Support'),
        icon: <BubbleTextIcon aria-hidden="true" width="24" height="24" />,
        callback: openCrispChat,
        show: crispEnabled,
      },
      {
        label: t('Onboarding'),
        icon: <WandAndStarsIcon aria-hidden="true" width="24" height="24" />,
        callback: modalOnbording.open,
        show: onboardingEnabled,
      },
    ],
    [modalOnbording.open, t, onboardingEnabled, crispEnabled],
  );

  return (
    <>
      <Box
        $css={css`
          .c__dropdown-menu-trigger {
            width: fit-content;
            justify-content: flex-start;
          }
        `}
      >
        <DropdownMenu
          options={options}
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        >
          <Box $direction="row" $align="center">
            <Button
              aria-label={t('Open help menu')}
              color={colorButton || 'neutral'}
              variant="tertiary"
              iconPosition="left"
              icon={
                <HelpIcon
                  aria-hidden="true"
                  color="inherit"
                  width="24"
                  height="24"
                />
              }
              onClick={toggleMenu}
            />
          </Box>
        </DropdownMenu>
      </Box>

      <OnBoarding
        isOpen={modalOnbording.isOpen}
        onClose={modalOnbording.close}
      />
    </>
  );
};
