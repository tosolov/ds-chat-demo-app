import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslate } from '../../i18n/index.js'
import {
  IconPanelLeftOutline16,
  IconRefreshOutline16,
  IconSettingsOutline16,
  IconWalletOutline16,
  NewChatIcon,
} from '../base/icons.js'
import {
  formatBalanceAmount,
  pickPrimaryBalance,
  refreshBalance,
  useBalanceStore,
} from '../../services/balance.js'
import { setSiderCollapsed, useSettings } from '../../services/settings.js'
import { groupSessions } from '../../services/chat/sessionGroups.js'
import { newChat, removeSession, useChatStore } from '../../services/chat/store.js'
import type { SessionSummary } from '../../services/chat/types.js'
import { Button } from '../base/Button.js'
import { IconButton } from '../base/IconButton.js'
import { Modal } from '../base/Modal.js'
import { showToast } from '../base/toastState.js'
import { openSettings } from '../settings/settingsDialogState.js'
import { closeMobileSider, useMobileSider } from './mobileSiderState.js'
import { SessionItem } from './SessionItem.js'
import styles from './Sider.module.css'

/** 展开的侧边栏：名称与收起按钮、开启新对话、按时间分组的会话列表、底部设置；移动端放在抽屉里，收起按钮关闭抽屉 */
export const Sider = ({ mobile = false }: { mobile?: boolean }) => {
  const t = useTranslate()
  const sessions = useChatStore((state) => state.sessions)
  const activeId = useChatStore((state) => state.activeId)
  const [now, setNow] = useState(Date.now)
  const groups = useMemo(() => groupSessions(sessions, now, t), [sessions, now, t])
  const [deleting, setDeleting] = useState<SessionSummary | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      clearTimeout(timer)
      const time = Date.now()
      setNow(time)
      const midnight = new Date(time).setHours(24, 0, 0, 0)
      timer = setTimeout(refresh, midnight - time)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }
    refresh()
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return (
    <div className={clsx(styles.sider, mobile && styles.mobile)}>
      <div className={styles.top}>
        <div className={styles.appName}>{t('appName')}</div>
        <IconButton
          size="m"
          icon={<IconPanelLeftOutline16 />}
          tooltip={t('collapseSiderbarButton')}
          tooltipPlacement="bottom"
          onClick={() => (mobile ? closeMobileSider() : setSiderCollapsed(true))}
        />
      </div>
      <button
        type="button"
        className={styles.newChat}
        onClick={() => {
          newChat()
          closeMobileSider()
        }}
      >
        <span className={styles.newChatIcon}>
          <NewChatIcon />
        </span>
        {t('newChat')}
      </button>
      <div className={styles.listWrap}>
        <div className={styles.list}>
          {groups.map((group) => (
            <div key={group.key} className={styles.section}>
              <div className={styles.sectionHeader}>{group.label}</div>
              {group.sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  active={session.id === activeId}
                  onDelete={() => setDeleting(session)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <SiderBalance />
        <button type="button" className={styles.settings} onClick={() => openSettings('general')}>
          <span className={styles.settingsIcon}>
            <IconSettingsOutline16 />
          </span>
          <span className={styles.settingsLabel}>{t('settings')}</span>
        </button>
      </div>
      {deleting ? (
        <Modal
          title={t('deleteSessionModalContentTitle')}
          onClose={() => {
            if (!deletePending) {
              setDeleting(null)
            }
          }}
          footer={
            <>
              <Button variant="outlined" disabled={deletePending} onClick={() => setDeleting(null)}>
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                disabled={deletePending}
                onClick={async () => {
                  setDeletePending(true)
                  try {
                    if (await removeSession(deleting.id)) {
                      setDeleting(null)
                    } else {
                      showToast({ key: 'sessionDeleteFailed', type: 'error' })
                    }
                  } finally {
                    setDeletePending(false)
                  }
                }}
              >
                {t('delete')}
              </Button>
            </>
          }
        >
          {t('deleteSessionWithFilesDescription')}
        </Modal>
      ) : null}
    </div>
  )
}

/** 侧边栏底部余额卡片：未设 Key 时引导设置，已设 Key 时展示余额与快捷刷新 */
const SiderBalance = () => {
  const t = useTranslate()
  const apiKey = useSettings((state) => state.apiKey)
  const balance = useBalanceStore((state) => state.balance)
  const loading = useBalanceStore((state) => state.loading)
  const error = useBalanceStore((state) => state.error)

  if (!apiKey) {
    return (
      <button
        type="button"
        className={styles.balanceCard}
        onClick={() => {
          closeMobileSider()
          openSettings('data')
        }}
      >
        <span className={styles.balanceIcon}>
          <IconWalletOutline16 />
        </span>
        <span className={styles.balanceBody}>
          <span className={styles.balanceLabel}>{t('apiBalanceEmpty')}</span>
          <span className={styles.balanceSub}>{t('apiBalanceTapToSet')}</span>
        </span>
      </button>
    )
  }

  const primary = pickPrimaryBalance(balance)
  const hasMultipleBreakdown =
    primary !== null &&
    (Number(primary.granted_balance) > 0 || Number(primary.topped_up_balance) > 0)

  return (
    <div className={styles.balanceCard}>
      <button
        type="button"
        className={styles.balanceMain}
        onClick={() => {
          if (error) {
            void refreshBalance({ force: true })
          } else {
            closeMobileSider()
            openSettings('data')
          }
        }}
      >
        <span className={styles.balanceIcon}>
          <IconWalletOutline16 />
        </span>
        <span className={styles.balanceBody}>
          <span className={styles.balanceRow}>
            <span className={styles.balanceLabel}>{t('apiBalance')}</span>
            {balance && !balance.is_available ? (
              <span className={styles.balanceWarn}>{t('apiBalanceUnavailable')}</span>
            ) : null}
          </span>
          <span className={clsx(styles.balanceValue, error && styles.balanceError)}>
            {loading && !primary
              ? t('apiBalanceLoading')
              : error && !primary
                ? error
                : primary
                  ? formatBalanceAmount(primary.currency, primary.total_balance)
                  : t('apiBalanceNoInfo')}
          </span>
          {primary && hasMultipleBreakdown ? (
            <span className={styles.balanceSub}>
              {t('apiBalanceBreakdown', {
                granted: formatBalanceAmount(primary.currency, primary.granted_balance),
                toppedUp: formatBalanceAmount(primary.currency, primary.topped_up_balance),
              })}
            </span>
          ) : null}
        </span>
      </button>
      <IconButton
        size="m"
        icon={
          <span className={clsx(styles.refreshSpin, loading && styles.refreshSpinning)}>
            <IconRefreshOutline16 />
          </span>
        }
        tooltip={t('apiBalanceRefresh')}
        aria-label={t('apiBalanceRefresh')}
        disabled={loading}
        onClick={() => void refreshBalance({ force: true })}
      />
    </div>
  )
}

/** 移动端抽屉：浮在页面上方，点空白区域关闭。 */
export const MobileSider = () => {
  const open = useMobileSider((state) => state.open)
  if (!open) {
    return null
  }
  return (
    <>
      <div className={styles.drawerMask} onClick={closeMobileSider} />
      <div className={styles.drawer}>
        <Sider mobile />
      </div>
    </>
  )
}
