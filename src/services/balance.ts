import { create } from 'zustand'
import { ApiError, fetchUserBalance } from './api/client.js'
import { classifyApiError } from './api/errors.js'
import type { BalanceInfo, UserBalanceResponse } from './api/types.js'
import { translate } from '../i18n/index.js'
import { useSettings } from './settings.js'

type BalanceState = {
  balance: UserBalanceResponse | null
  loading: boolean
  error: string | null
  updatedAt: number | null
}

export const useBalanceStore = create<BalanceState>(() => ({
  balance: null,
  loading: false,
  error: null,
  updatedAt: null,
}))

let inflightController: AbortController | null = null
let inflightPromise: Promise<void> | null = null

const formatCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case 'CNY':
      return '¥'
    case 'USD':
      return '$'
    default:
      return `${currency} `
  }
}

/** 格式化单币种金额，例如 CNY 110.00 -> ¥110.00 */
export const formatBalanceAmount = (currency: string, amount: string): string => {
  const parsed = Number(amount)
  const formatted = Number.isFinite(parsed) ? parsed.toFixed(2) : amount
  return `${formatCurrencySymbol(currency)}${formatted}`
}

/** 优先选取 CNY，其次取第一条余额记录 */
export const pickPrimaryBalance = (data: UserBalanceResponse | null): BalanceInfo | null => {
  if (!data?.balance_infos.length) {
    return null
  }
  return (
    data.balance_infos.find((item) => item.currency.toUpperCase() === 'CNY') ??
    data.balance_infos[0] ??
    null
  )
}

const describeBalanceError = (error: unknown): string => {
  switch (classifyApiError(error)) {
    case 'unauthorized':
      return translate('apiKeyInvalid')
    case 'network':
      return translate('commonNetworkErrorToast')
    default:
      if (error instanceof ApiError && error.localMessage) {
        return translate(error.localMessage.key, error.localMessage.params)
      }
      return translate('apiBalanceFailed')
  }
}

export const resetBalance = () => {
  inflightController?.abort()
  inflightController = null
  inflightPromise = null
  useBalanceStore.setState({
    balance: null,
    loading: false,
    error: null,
    updatedAt: null,
  })
}

/** 查询官方 API 余额；支持去重和最小刷新间隔控制 */
export const refreshBalance = async ({
  force = false,
  minAgeMs = 0,
}: {
  force?: boolean
  minAgeMs?: number
} = {}): Promise<void> => {
  const apiKey = useSettings.getState().apiKey
  if (!apiKey) {
    resetBalance()
    return
  }

  const { updatedAt } = useBalanceStore.getState()
  if (!force && minAgeMs > 0 && updatedAt !== null && Date.now() - updatedAt < minAgeMs) {
    return
  }

  if (inflightPromise) {
    if (!force) {
      return inflightPromise
    }
    inflightController?.abort()
  }

  const controller = new AbortController()
  inflightController = controller
  useBalanceStore.setState({ loading: true, error: null })

  const task = (async () => {
    try {
      const data = await fetchUserBalance(apiKey, controller.signal)
      if (controller.signal.aborted || useSettings.getState().apiKey !== apiKey) {
        return
      }
      useBalanceStore.setState({
        balance: data,
        loading: false,
        error: null,
        updatedAt: Date.now(),
      })
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }
      useBalanceStore.setState({
        loading: false,
        error: describeBalanceError(error),
      })
    } finally {
      if (inflightController === controller) {
        inflightController = null
        inflightPromise = null
      }
    }
  })()

  inflightPromise = task
  return task
}

let lastApiKey = useSettings.getState().apiKey
useSettings.subscribe((state) => {
  if (state.apiKey === lastApiKey) {
    return
  }
  lastApiKey = state.apiKey
  if (!lastApiKey) {
    resetBalance()
  } else {
    void refreshBalance({ force: true })
  }
})
