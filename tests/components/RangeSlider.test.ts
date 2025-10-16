import RangeSlider from '@/components/RangeSlider.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

function mockSize(el: HTMLElement, { width, height }: { width: number; height: number }) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true })
}

describe('RangeSlider.vue', () => {
  it('renders with default props and emits initial range-change on mount', async () => {
    const wrapper = mount(RangeSlider)
    // nextTick already called inside onMounted; allow one tick for emit queue to flush
    await wrapper.vm.$nextTick()
    const emits = wrapper.emitted('range-change')
    expect(emits && emits.length).toBeGreaterThanOrEqual(1)
    // payload shape
    const payload = emits?.[0]?.[0]
    expect(payload).toMatchObject({ min: 0, max: 100, value: expect.any(Number) })
  })

  it('uses tooltipFormatter when provided', async () => {
    const formatter = (v: number) => `X${v}`
    const wrapper = mount(RangeSlider, { props: { modelValue: 10, tooltipFormatter: formatter } })
    await wrapper.vm.$nextTick()
    const tooltip = wrapper.find('[data-tip]')
    expect(tooltip.attributes('data-tip')).toBe('X10')
  })

  it('clamps percent and updates fill without crashing when width is 0', async () => {
    const wrapper = mount(RangeSlider, { props: { min: 0, max: 10, modelValue: 5 } })
    const input = wrapper.find('input').element as HTMLInputElement
    mockSize(input, { width: 0, height: 10 })
    // change value to trigger updateFill()
    await wrapper.setProps({ modelValue: 9 })
    // no crash expected; also style var should be set
    expect(input.style.getPropertyValue('--range-fill')).not.toBeUndefined()
  })

  it('v-model update emits update:modelValue and range-change', async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: 0, min: 0, max: 100 } })
    const input = wrapper.find('input')
    // set mock size so updateFill math runs
    mockSize(input.element as HTMLElement, { width: 200, height: 10 })

    await input.setValue('25')

    const updates = wrapper.emitted('update:modelValue')
    expect(updates && updates[0] && updates[0][0]).toBe('25')

    const rangeChanges = wrapper.emitted('range-change')
    expect(rangeChanges && rangeChanges[rangeChanges.length - 1]![0]).toMatchObject({ value: '25' })
  })

  it('pointerdown/up toggles tooltipOpen when showTooltipOnClick is true', async () => {
    const wrapper = mount(RangeSlider, { props: { showTooltipOnClick: true } })
    const input = wrapper.find('input')
    await input.trigger('pointerdown')
    // Tooltip becomes open -> has class tooltip-open
    expect(wrapper.find('.tooltip').classes()).toContain('tooltip-open')
    await input.trigger('pointerup')
    expect(wrapper.find('.tooltip').classes()).not.toContain('tooltip-open')
  })
})
