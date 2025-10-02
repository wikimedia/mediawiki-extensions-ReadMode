<?php

use MediaWiki\MediaWikiServices;

class ReadMode {

	/**
	 * Add modules
	 * @param OutputPage &$out
	 * @param Skin &$skin
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		$out->addModules( 'ext.ReadMode' );
		$out->addModuleStyles( 'ext.ReadMode.styles' );
	}

	/**
	 * Add preference
	 * @param User $user
	 * @param array &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['read-mode'] = [
			'section' => 'rendering/skin/skin-prefs',
			'type' => 'toggle',
			'label-message' => 'readmode-enable',
			'help-message' => 'readmode-enable-help',
		];
	}

	/**
	 * Add class to the body
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @param array &$bodyAttrs
	 */
	public static function onOutputPageBodyAttributes( OutputPage $out, Skin $skin, array &$bodyAttrs ) {
		$title = $skin->getTitle();
		$action = $skin->getActionName();
		if ( $title->isContentPage() && $action === 'view' ) {
			$user = $skin->getUser();
			if ( $user->isAnon() ) {
				$request = $skin->getRequest();
				$readMode = $request->getCookie( 'ReadMode' );
			} else {
				$services = MediaWikiServices::getInstance();
				$userOptionsLookup = $services->getUserOptionsLookup();
				$readMode = $userOptionsLookup->getOption( $user, 'read-mode' );
			}
			if ( $readMode ) {
				$bodyAttrs['class'] .= ' read-mode';
			}
		}
	}
}
