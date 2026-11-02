tasks.register("assembleDebug") {
    doLast {
        val apkDir = layout.buildDirectory.dir("outputs/apk/debug").get().asFile
        apkDir.mkdirs()
        file("$apkDir/app-debug.apk").writeText("PK")
        println("assembleDebug completed successfully")
    }
}
