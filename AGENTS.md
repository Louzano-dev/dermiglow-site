<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Portfolio architecture
- Use the bundled demo catalog as the only storefront product source, keeping its Shopify-compatible shape at a local query adapter boundary to preserve existing views without remote store dependencies.
- Cart actions persist only in the portfolio-specific browser storage key; checkout must never return or open a payment URL.
- The portfolio routine builder uses local preference-based selection rather than remote Shopify or AI calls so its core flow works without subscriptions.
