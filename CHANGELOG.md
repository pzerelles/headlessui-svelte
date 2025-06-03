# @pzerelles/headlessui-svelte

## 2.1.2-next.59

### Patch Changes

- 0e88a27: fix: add PortalWrapper to apply nested portal context only to children

## 2.1.2-next.58

### Patch Changes

- 6fdece1: feat: export hooks useActivePress, useFocusRing and useHover

## 2.1.2-next.57

### Patch Changes

- 80a8e37: fix: leave data-closed at end of transition to work with coordinated transitions and varying durations

## 2.1.2-next.56

### Patch Changes

- c036919: feat: export useOutsideClick and useEscape hooks

## 2.1.2-next.55

### Patch Changes

- 300319c: fix: make RadioGroup value bindable

## 2.1.2-next.54

### Patch Changes

- e405842: fix: correctly merge disabled prop with disabled provider value for RadioGroup and Select

## 2.1.2-next.53

### Patch Changes

- 0dd1065: fix: set TransitionContext earlier

## 2.1.2-next.52

### Patch Changes

- d22f791: fix: allow useTransition() with asChild

## 2.1.2-next.51

### Patch Changes

- 73bb982: feat: support TransitionChild inside components with useTransition()

## 2.1.2-next.50

### Patch Changes

- f634816: fix: add ClassValue support to Legend and Listbox

## 2.1.2-next.49

### Patch Changes

- b177d65: fix: only render Transition as <div> if it has class or enter/leave classes

## 2.1.2-next.48

### Patch Changes

- 8d2b013: fix: prevent warning when using asChild without an element

## 2.1.2-next.47

### Patch Changes

- 224860c: feat: support Svelte 5.16+ enhanced class attribute

## 2.1.2-next.46

### Patch Changes

- c12b0a5: feat: add Disclosure components

## 2.1.2-next.45

### Patch Changes

- 5d1de85: fix: removed unused import from inner.svelte.ts

## 2.1.2-next.44

### Patch Changes

- 64b25a3: fix: type of PopoverButton
- 76b6aa6: fix: slot data attributes for some components

## 2.1.2-next.43

### Patch Changes

- 9098ddd: fix: effect loop in Popover and other warnings
- 1249705: chore: update dependencies

## 2.1.2-next.42

### Patch Changes

- 2978d05: fix: ListBox keyboard navigation

## 2.1.2-next.41

### Patch Changes

- 59486a7: fix: make Select's value bindable

## 2.1.2-next.40

### Patch Changes

- a0db637: feat: add RadioGroup components

## 2.1.2-next.39

### Patch Changes

- e347262: fix: remove svelte:fragment for Transition
- e2f2e70: fix: disabled on Switch

## 2.1.2-next.38

### Patch Changes

- 4dd13bf: chore: upgrade to Svelte 5 release

## 2.1.2-next.37

### Patch Changes

- a40d098: fix: further simplify types

## 2.1.2-next.36

### Patch Changes

- 311ecd3: feat: allow Props type to use object instead of tag name

## 2.1.2-next.35

### Patch Changes

- e41187d: feat: add "...OwnProps" types for components

## 2.1.2-next.34

### Patch Changes

- 73d52dd: feat: add types for component slots

## 2.1.2-next.33

### Patch Changes

- f4a3715: refactor: remove "as" in favor of "asChild" to simplify types and avoid problems with typescript
- f4a3715: feat: add support for components in "as"

## 2.1.2-next.32

### Patch Changes

- 9c27f77: fix: narrow TSlot type

## 2.1.2-next.31

### Patch Changes

- d13e627: fix: only export useFloatingProvider once

## 2.1.2-next.30

### Patch Changes

- e65136b: fix: preprocess typescript

## 2.1.2-next.29

### Patch Changes

- e306b59: fix: svelte-check errors in Transition
- 529ca77: fix: Listbox generics

## 2.1.2-next.28

### Patch Changes

- af0a3ae: feat: add ignoreParent option to provideDisabled

## 2.1.2-next.27

### Patch Changes

- b6ac726: feat: add DisabledProvider component

## 2.1.2-next.26

### Patch Changes

- 83afe7f: feat: export disabled context functions

## 2.1.2-next.25

### Patch Changes

- 8356649: fix: try to simplify types

## 2.1.2-next.24

### Patch Changes

- 20ca763: refactor: change children's argument to single object

## 2.1.2-next.23

### Patch Changes

- eb6d264: fix: description and disabled contexts
- ae9a36d: fix: move menu context completely out of component

## 2.1.2-next.22

### Patch Changes

- 579909c: fix: autofocus prop of PopoverButton

## 2.1.2-next.21

### Patch Changes

- f10e6bd: feat: export more types for PopoverButton

## 2.1.2-next.20

### Patch Changes

- cc442ab: feat: add Popover components

## 2.1.2-next.19

### Patch Changes

- bcf41cb: fix: closeOnSelect passed in context of Listbox

## 2.1.2-next.18

### Patch Changes

- f013512: feat: add "closeOnSelect" option to Listbox

## 2.1.2-next.17

### Patch Changes

- 2f4bd5c: fix: type of component children

## 2.1.2-next.16

### Patch Changes

- 4fb3639: fix: return from hoistFromFields

## 2.1.2-next.15

### Patch Changes

- ee3f289: feat: add Select component
- 8afc394: fix: hoist form fields correctly

## 2.1.2-next.14

### Patch Changes

- d18e2bf: fix: move menu context out of component

## 2.1.2-next.13

### Patch Changes

- b8580aa: fix: listbox active item state

## 2.1.2-next.12

### Patch Changes

- f50fc0f: fix: selection anchor when using ListboxSelectedOption

## 2.1.2-next.11

### Patch Changes

- 58e427e: fix: problems with listbox transitions
- 7cf8bd8: refactor: add support for "inner" to floating

## 2.1.2-next.10

### Patch Changes

- 7c92aad: fix: use Snippet for ListboxSelectedOption options and placeholder

## 2.1.2-next.9

### Patch Changes

- ac29561: fix: provided id for Switch

## 2.1.2-next.8

### Patch Changes

- 30d377a: fix: transpile typescript to javascript for distribution

## 2.1.2-next.7

### Patch Changes

- 7b4ae3c: fix: use generic value for Input and Textarea

## 2.1.2-next.6

### Patch Changes

- 4ac233c: fix: autofocus on Textarea and htmlFor on Label

## 2.1.2-next.5

### Patch Changes

- 30ecf97: fix: remove enums from component modules

## 2.1.2-next.4

### Patch Changes

- 2498ecc: fix: controlled switch behavior

## 2.1.2-next.3

### Patch Changes

- 031ca55: feat: add Textarea coponent

## 2.1.2-next.2

### Patch Changes

- 10888b5: feat: add Button component
- 4bdd38e: feat: add Menu component
- 6670012: feat: add DataInteractive component
- 4eff6ce: feat: add CloseButton component

## 2.0.0-next.1

### Minor Changes

- 7df10f4: feat: add Checkbox, Description, Field, Fieldset, Label and Legend components
