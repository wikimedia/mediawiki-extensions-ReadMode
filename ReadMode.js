const ReadMode = {

	async init( portlet ) {
		if ( portlet.id === 'skin-client-prefs-vector-feature-custom-font-size' ) {
			const require = await mw.loader.using( '@wikimedia/codex' );
			const Vue = require( 'vue' );
			const Codex = require( '@wikimedia/codex' );
			const app = Vue.createMwApp( ReadMode.switchComponent );
			app.component( 'cdx-toggle-switch', Codex.CdxToggleSwitch );

			// If we're in read mode, mount the switch next to the first heading
			// else, mount it before the font size portlet
			const mountPoint = document.createElement( 'div' );
			const readMode = mw.user.isAnon() ? mw.cookie.get( 'ReadMode' ) : mw.user.options.get( 'read-mode' );
			const action = mw.config.get( 'wgAction' );
			const pageNamespace = mw.config.get( 'wgNamespaceNumber' );
			const contentNamespaces = mw.config.get( 'wgContentNamespaces' );
			if ( readMode && action === 'view' && contentNamespaces.includes( pageNamespace ) ) {
				document.getElementById( 'firstHeading' ).after( mountPoint );
			} else {
				portlet.before( mountPoint );
			}
			app.mount( mountPoint );
		}
	},

	switchComponent: {

		template: '<cdx-toggle-switch id="read-mode-switch" :disabled="disabled" v-model="readMode" @update:model-value="onUpdate">Read mode</cdx-toggle-switch>',

		data() {
			const action = mw.config.get( 'wgAction' );
			const pageNamespace = mw.config.get( 'wgNamespaceNumber' );
			const contentNamespaces = mw.config.get( 'wgContentNamespaces' );
			const readMode = mw.user.isAnon() ? mw.cookie.get( 'ReadMode' ) : mw.user.options.get( 'read-mode' );
			return {
				disabled: action !== 'view' || !contentNamespaces.includes( pageNamespace ),
				readMode: Boolean( readMode )
			};
		},

		mounted() {
			mw.hook( 've.activationComplete' ).add( () => {
				this.disabled = true;
			} );
			mw.hook( 've.deactivationComplete' ).add( () => {
				this.disabled = false;
			} );
		},

		methods: {
			onUpdate() {
				if ( this.readMode ) {
					document.body.classList.add( 'read-mode' );
					document.getElementById( 'firstHeading' ).after( this.$el );
					if ( mw.user.isAnon() ) {
						mw.cookie.set( 'ReadMode', 1 );
					} else {
						mw.user.options.set( 'read-mode', 1 );
						new mw.Api().saveOption( 'read-mode', 1 );
					}
				} else {
					document.body.classList.remove( 'read-mode' );
					document.getElementById( 'skin-client-prefs-vector-feature-custom-font-size' ).before( this.$el );
					if ( mw.user.isAnon() ) {
						mw.cookie.set( 'ReadMode', null );
					} else {
						mw.user.options.set( 'read-mode', null );
						new mw.Api().saveOption( 'read-mode', null );
					}
				}
			}
		}
	}
};

mw.hook( 'util.addPortlet' ).add( ReadMode.init );
