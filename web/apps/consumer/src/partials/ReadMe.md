# FuneralEase Components (Partials Stytem)

This directory contains our reusable global atomic components. Centralizing these UI building blocks ensures design system consistency across the entire application and allows for global UI style adjustments from a single file directory.

## Core Component Inventory

### buttons.tsx

Manages all custom standard button types, active micro-interactions, scale states, and sizing hooks.

**Available Variants (`variant`):** 

* `main` (default baseline theme style) 
* `sec`
* `danger`
* `outline`
* `outline_dark`
* `delete`

**Usage Examples:**

```jsx
// first import the buttons componant into your file 
import {Button} from @\partials;
```

```jsx
// outline button
<Button
type="button"
onClick={() => { setStep("phone"); setError(""); }}
variant="outline"
className="w-full"
>
Use a different number
</Button>
```

For the default button omit the variant attribute

```jsx
<Button
type="submit"
disabled={loading || !phone || pin.length < 6}
className="mx-auto w-full"

>
{loading ? "Signing in…" : "Sign in"}
</Button>
```

If needed more styles can be added using className Attribute

### text.tsx

Handles clean structural typography variants, semantic tag switching, layout color mapping, and relative word wrapping layouts.

**Text Layout Variants (`variant`):** 

* `heading_main` 
* `heading_sub`
* `heading_small`
* `body` (default fallback template layout)
* `body_small`
* `body_small_sec`
* `heading_sec_lg`

**Color variants (`color`):** 

* `light` 
* `dark` (Default theme color)
* `candle`

**Opacity Utility Properties:**

* `faded` 
* `superFaded`

_these can be edited here_

```jsx
// text.tsx

const opacityClass = superFaded ? 'opacity-40' : faded ? 'opacity-80' : '';
```

**Usage Examples:**

1. first import the text component into your file 
   
   ```jsx
   import {Text} from "@/partials";
   ```

2. Use the Text Component in code
   
   ```jsx
   <Text as="h1" variant="heading_main" color="light" className="animate-fade-up-delay lg:max-w-xl">
   My Title
   </Text>
   ```

_for faded text_ 

```jsx
<Text  as="span" variant="body" faded color="dark" className="mt-5 mx-auto max-w-md">
  This is normal body text that can be safely repositioned on any screen.
</Text>
```

___

### form_inputs.tsx

Processes multi-variant HTML element entry states. Enforces uniform inputs, handles standard field styling grids, incorporates accessibility helpers.

**Input Layout Variations (`variant`):**

* `text` (default)
* `phone` 
* `otp`
* `pin`
* `checkbox`

**Usage Examples:**

1. first import the Input component into your file 
   
   ```jsx
   import {Input} from "@/partials";
   ```

2. Use the Text Component in code
   
   ```jsx
   /* Normal Text variant */
   <Input 
   label="Email Address" 
   variant="text" 
   placeholder="you@example.com" 
   type="email"
   ref={emailRef}
   />
   
   /* Phone variant */
   <Input 
   label="Phone Number" 
   variant="phone" 
   placeholder="+27 98 765 4321" 
   type="tel"
   />
   
   /* Checkbox Variant (Using custom children layout instead of a plain string label) */
   <Input 
   variant="checkbox" 
   label="I agree to the Terms of Service" 
   required 
   />
   
   /* 5. Checkbox Variant (Using custom children layout instead of a plain string label) */
   <Input variant="checkbox">
    <span>Accept our <a href="/privacy" className="underline text-blue-600">Privacy Policy</a></span>
   </Input>
   ```

_for otp input fields_

```jsx
{otpDigits.map((digit, i) => (
    <Input
    key={i}
    variant="otp" 
    inputMode="numeric"
    maxLength={1}
    value={digit}
    autoFocus={i === 0}
    className="w-full"

    /* Attach the array ref cleanly */
    ref={(el) => { otpRefs.current[i] = el; }}

    /* Keep the specific form logic here on the page */
    onChange={(e) => handleChange(e, i)}
    onKeyDown={(e) => handleKeyDown(e, i, digit)}
    onPaste={handlePaste}
    />
))}
```