import { render } from "@testing-library/svelte"
import {
  assertListbox,
  assertListboxButton,
  getListboxButton,
  ListboxState,
} from "$lib/test-utils/accessability-assertions.js"
import Listbox1 from "./_test_components/Listbox-1.test.svelte"
import Listbox2 from "./_test_components/Listbox-2.test.svelte"
import ListboxButton from "./ListboxButton.svelte"
import ListboxOptions from "./ListboxOptions.svelte"
import ListboxOption from "./ListboxOption.svelte"
import { Label } from "$lib/label/index.js"
import { click } from "$lib/test-utils/interactions.js"

vitest.mock("$lib/hooks/use-id.js", () => {
  return {
    useId: () => "1",
  }
})

beforeAll(() => {
  global.ResizeObserver = vitest.fn().mockImplementation(() => ({
    observe: vitest.fn(),
    unobserve: vitest.fn(),
    disconnect: vitest.fn(),
  }))
})

describe("safeguards", () => {
  it.each([
    ["ListboxButton", ListboxButton],
    ["Label", Label],
    ["ListboxOptions", ListboxOptions],
    ["ListboxOption", ListboxOption],
  ])("should error when we are using a <%s /> without a parent <Listbox />", (name, Component) => {
    if (name === "Label") {
      // @ts-expect-error This is fine
      expect(() => render(Component)).toThrow("You used a <Label /> component, but it is not inside a relevant parent.")
    } else {
      // @ts-expect-error This is fine
      expect(() => render(Component)).toThrow(`<${name} /> is missing a parent <Listbox /> component.`)
    }
  })

  it("should be possible to render a Listbox without crashing", () => {
    render(Listbox1)

    assertListboxButton({
      state: ListboxState.InvisibleUnmounted,
      attributes: { id: "headlessui-listbox-button-1" },
    })
    assertListbox({ state: ListboxState.Visible })
  })
})

describe("Rendering", () => {
  describe("Listbox", () => {
    it("should be possible to render a Listbox using a render prop", async () => {
      render(Listbox2)

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: "headlessui-listbox-button-1" },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      await click(getListboxButton())

      assertListboxButton({
        state: ListboxState.Visible,
        attributes: { id: "headlessui-listbox-button-1" },
      })
      assertListbox({ state: ListboxState.Visible })
    })
  })
})
