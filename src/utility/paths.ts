import electron from 'electron'
import path from 'path'

const app = (electron.app || electron.remote.app)

// https://www.electron.build/configuration/contents#extraresources
const map: { [key: string]: string } = {

	darwin: path.resolve(
		// Mac Resources path (with library executables) is under Resources directory,
		//  which is in same root as MacOS folder, 
		//  which is the directory with the main electron app executable
		app.getPath('exe'),
		'../../Resources'
	),

	win32: path.resolve(
		// app.getPath('exe'),
		'resources'
	),

	linux: path.resolve(
		// app.getPath('exe'),
		'resources'
	),
}

/**
 * 
 * @param {string} resource
 * @returns {string}
 */
export function getResourcePath(resource: string): string {
	// If dev enviroment - use global executable
	if (process.env.NODE_ENV !== "production") {
		return path.resolve('src', resource)
	}

	return path.resolve(getResourcesDirectory(), resource)
}

export function getResourcesDirectory(): string {
	const platform: string = process.platform

	if (!(platform in map)) {
		throw new Error('Invalid platform')
	}

	return map[platform]
}

export default {
	getResourcePath
}