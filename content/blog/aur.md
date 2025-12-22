+++
title = "How to Use the Arch Linux User Repository"
date = 2025-12-21
[taxonomies]
tags = ["linux", "arch-linux"]
+++

Hey everyone! Today, I want to show you how to use the **AUR** (*Arch User Repository*). This is hands down one of the best things about Arch Linux, and honestly, if you're going to use this distro, knowing how to use the AUR is practically a requirement.

Basically, it's a repository maintained by the community. If you can't find a package in the official repositories using **Pacman**, there is almost certainly someone who has created an entry for it in the AUR.

👉 **Official AUR website:**
[https://aur.archlinux.org](https://aur.archlinux.org)

There are two ways to install packages from the AUR:

1. The **manual way**, which I'll show you first.
2. Using tools called **AUR helpers**, which automate much of the process.

I want to teach you the manual method first because it's really cool—and *important*—to understand how everything works under the hood.

---

## Prerequisites

Before we start, the first thing you need to do is install two specific packages: `git` and `base-devel`. You probably already installed these while setting up Arch.

```bash
sudo pacman -S git base-devel
```

These packages provide all the tools required to build and install software from the AUR.

I also recommend creating a dedicated directory to keep things organized. This is where you'll clone AUR packages if you plan to build them manually. I already had one set up for cloning GitHub projects, so I'll reuse that.

---

## Method 1: The Manual Way

For today's example, I'm going to use **Brave Browser**. (I personally use **LibreWolf**, but Brave is a solid browser as well.)

### Step 1: Finding the Package

First, head over to the AUR website and search for the package you want.

{% note(title="Careful!", type="warning") %}
You will often see multiple versions of the same package. Usually, one of them has a `-bin` suffix (for example, `brave-bin`).

**You generally want the `-bin` version.**
This stands for *binary release*, meaning it's already compiled. If you install the version *without* `-bin`, it will compile the software from source on your machine. Compiling a web browser can take a *very* long time, so if you want to save time, go with the binary.
{% end %}

**Before you download anything:**

1. Check that the package is **not flagged as "Out of Date."**
2. **Read the comments.** This is extremely important. If users are having issues, the solution is often documented there or in pinned messages.

---

### Step 2: Cloning the Repository

Once you've chosen the package, copy the **Git Clone URL** from the AUR page.

```bash
git clone https://aur.archlinux.org/brave-bin.git
```

Now, navigate into the newly created directory.

---

### Step 3: The PKGBUILD (Read This!)

Inside the folder, you'll always find a file called `PKGBUILD`. This file contains all the instructions required to download, build, and install the package.

Most people never open this file, but **if you want to be a responsible user, you absolutely should**.

Here's what a real `PKGBUILD` looks like (example from `brave-bin`):

```bash
# Maintainer: brave <aur-release@brave.com>
# Contributor: Caleb Maclennan <caleb@alerque.com>
# Contributor: José Miguel Sarasola <jmsaraur@gmail.com>
# Contributor: Như Bảo Trương <28810481+nhubaotruong@users.noreply.github.com>
# Contributor: Andrés Rodríguez <hello@andres.codes>
# Contributor: Jacob Mischka <jacob@mischka.me>
# Contributor: Manuel Mazzuola <origin.of@gmail.com>
# Contributor: Simón Oroño <simonorono@protonmail.com>
# Contributor: now-im <now im 627 @ gmail . com>
# Contributor: Giusy Digital <kurmikon at libero dot it>

pkgname=brave-bin
pkgver=1.85.116
pkgrel=1
epoch=1
pkgdesc='Web browser that blocks ads and trackers by default (binary release)'
arch=(x86_64 aarch64)
url=https://brave.com
license=(MPL2 BSD custom:chromium)
depends=(alsa-lib gtk3 libxss nss ttf-font)
optdepends=(
	'cups: Printer support'
	'libgnome-keyring: Enable GNOME keyring support'
	'libnotify: Native notification support'
)
provides=("${pkgname%-bin}=$pkgver" 'brave-browser')
conflicts=("${pkgname%-bin}")
options=(!strip)
```

As you can see, it's essentially a shell script. Here's what you should look for:

* **Conflicts:** Make sure it doesn't clash with packages you already have installed.
* **Dependencies:** Sometimes a package pulls in far more dependencies than you might expect.
* **Commands:** Scroll to the bottom and inspect the commands being executed.

⚠️ **It wouldn't be the first time malware appeared in the AUR.**
There was a real incident not too long ago:
[https://lists.archlinux.org/archives/list/aur-general@lists.archlinux.org/thread/7EZTJXLIAQLARQNTMEW2HBWZYE626IFJ/](https://lists.archlinux.org/archives/list/aur-general@lists.archlinux.org/thread/7EZTJXLIAQLARQNTMEW2HBWZYE626IFJ/)

Remember: the AUR is a *community-maintained* repository, not an official one. Problems are rare, but always verify what you're running.

---

### Optional: Optimize Compilation Speed

If you're compiling software from source, you should edit `/etc/makepkg.conf` and look for `MAKEFLAGS`.

The `-j` flag controls how many threads are used during compilation. I recommend setting it to the number of threads your CPU has—but be aware that this will push your CPU to 100% usage while compiling.

```bash
#-- Make Flags: change this for DistCC/SMP systems
MAKEFLAGS="-j16"
```

{% note(title="Quick Tip", type="tip") %}
If you're not sure how many processing units your system has, run `nproc` in your terminal and use that number.
{% end %}

---

### Step 4: Build and Install

After reviewing the `PKGBUILD`, run this command inside the package directory:

```bash
makepkg
```

Once it finishes, you'll see a file ending in `.pkg.tar.zst`.

* `.pkg` → Package
* `.tar` → Archive
* `.zst` → Compressed using **Zstandard**

Install it using Pacman:

```bash
sudo pacman -U brave-bin-*-x86_64.pkg.tar.zst
```

And that's it—Brave is installed.

#### The Shortcut

You can combine building and installing into a single command:

```bash
makepkg -sri
```

* `-s` → Install missing dependencies
* `-i` → Install the package after building
* `-r` → Remove build-time dependencies afterward

---

### Updating and Removing

* **To update:** Enter the package directory, run `git pull`, then rerun `makepkg`.
* **To remove:** Use Pacman as usual, for example:

  ```bash
  sudo pacman -Rns brave-bin
  ```

---

## Method 2: AUR Helpers (The Easy Way)

Now let's talk about automation. The two most popular AUR helpers are:

* **Yay** (written in Go)
  [https://github.com/Jguer/yay](https://github.com/Jguer/yay)
* **Paru** (written in Rust)
  [https://github.com/Morganamilo/paru](https://github.com/Morganamilo/paru)

I've always used **Yay**, so that's what I'll demonstrate here—but Paru should be good as well.

{% note(title="Info", type="info") %}
Yay and Paru are *themselves* AUR packages, so you must install them using the **manual method** first.
{% end %}

---

### Using Yay

Once installed, Yay works almost exactly like Pacman. For example, to install **Zen Browser**:

```bash
yay -S zen-browser-bin
```

During installation, Yay will prompt you with a few questions:

1. **Clean build?**
   Yay caches build files in `$XDG_CACHE_HOME/yay` or `$HOME/.cache/yay`. A clean build removes cached files before rebuilding. I usually choose **None** (the default).
2. **Show diffs?**
   **Always choose "All."** This lets you inspect the `PKGBUILD`!

{% note(title="Important", type="warning") %}
**Do NOT run Yay with `sudo`.**
Yay handles permissions internally and will prompt you for your password when necessary. Running it with `sudo` will cause it to yell at you.
{% end %}

---

### Updating with Yay

One of Yay's biggest advantages is that it acts as a wrapper around Pacman:

```bash
yay -Syu
```

This updates **official Arch packages** *and* **AUR packages** in a single command. Pacman doesn't touch AUR packages during a system update, so Yay is super convenient for this.

---

## One Last Tip: DuckDuckGo Bangs

If you use **DuckDuckGo**, here's a great trick. DuckDuckGo supports *bangs*—short search shortcuts.

Typing:

```
!aur package_name
```

For example:

```
!aur paru
```

Will take you directly to the package's AUR page.

👉 DuckDuckGo Bangs documentation:
[https://duckduckgo.com/bangs](https://duckduckgo.com/bangs)

---

And that's how you use the AUR.
Now you can truly make the most of your Arch Linux installation.

**Thanks for reading!**
