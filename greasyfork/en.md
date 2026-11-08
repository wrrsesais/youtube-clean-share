# YouTube Clean Share

Use YouTube’s original Copy, social sharing and Embed controls with cleaner links. No extra buttons are added.

Removes si and feature=shared while preserving timestamps, playlists and playback options. Also cleans encoded YouTube links inside social sharing destinations and removes the share attribution used to generate si in iframe code.

Install with Tampermonkey, then refresh YouTube. Existing users should replace or update the previous script rather than keep two copies enabled.

Runs locally on the listed YouTube pages. No extra network requests, external code, stored share history or reading of the existing clipboard. Removing link parameters does not disable YouTube’s own analytics or tracking by destination sites.

Primarily validated in desktop Chrome. Edge and other browsers require further testing; installing Tampermonkey alone does not guarantee compatibility. The mobile YouTube app is outside the scope.
