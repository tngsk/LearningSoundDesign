# Bitwig Studio デバイス設計図（The Grid / Sampler）

このドキュメントは、サウンドデザイン講義の各デモをBitwig Studioで構築する際の、具体的なデバイスとモジュレーターの設定・結線図です。

---

## 1. エンベロープで操作する（時間の形をデザインする）

### 1.1 / 1.2 / 1.3 共通の基本デバイス構成
- **Device**: `Poly Grid` または `Sampler`
- **Modulator**: デバイスの左端のモジュレーター枠に `ADSR` を追加する。
- **Post FX**: `Oscilloscope` または `Spectrum` デバイスを後段に追加。

### 1.1: 音量（Amp）の操作
- **マッピング先**:
  - `Poly Grid` の場合: 出力直前の `Amp` または `Volume` ノブ。
  - `Sampler` の場合: `Amp Env` セクションのパラメーター。
- **操作手順**: `ADSR` モジュレーターから `Volume` に対してモジュレーションを割り当て、ノートオンでADSRをトリガーする。

### 1.2: ピッチ（Pitch）の操作
- **マッピング先**:
  - `Poly Grid` の場合: `Oscillator` モジュールの `Pitch` 入力。
  - `Sampler` の場合: 中央の `Pitch` ノブ。
- **設定値**: マッピングの深さを `+24.00` または `-24.00` (2オクターブ) など極端な値に設定する。

### 1.3: フィルター（Filter）の操作
- **マッピング先**:
  - `Poly Grid` の場合: `Sallen-Key` などのフィルターモジュールの `Cutoff`。
  - `Sampler` の場合: 搭載されている `Filter` セクションの `Cutoff` ノブ。
- **設定値**: Cutoff のベース値を低く（例：200Hz）設定し、`ADSR` モジュレーターから `+4000Hz` 分のマッピングを行う。

---

## 2. LFOで操作する（周期と揺らぎをデザインする）

### 2.1: ピッチ（ビブラートからアラーム）
- **Device**: `Poly Grid`
- **Modulator**: `LFO` を追加（波形：Sine）。
- **マッピング先**: `Oscillator` モジュールの `Pitch`。
- **操作手順**: `LFO` の `Rate`（Hz）と、マッピングの深さ（変調量）をリアルタイムに操作して見せる。

### 2.2: 音量（トレモロと注意喚起）
- **Device**: `Sampler`（環境音などのループ素材を読み込む）
- **Modulator**: `LFO` を追加（波形：Square または Pulse）。
- **マッピング先**: `Sampler` の `Volume` ノブ。
- **設定値**: `LFO` の深さを `-100%` に設定し、周期的に音が完全に消える（ダッキング的効果）を作る。

---

## 3. インタラクション・システム状況で操作する

### 3.1: 再生ヘッドの位置（グラニュラー）
- **Device**: `Sampler`
- **Modulator**: `Macro` ノブを追加（名前を "Playhead" に変更）。
- **Sampler の設定**:
  - 再生モードを `Repitch` から `Texture` または `Cycles` に変更する。
  - `Play` モードの矢印（通常は右向きのループ）を無効にし、再生位置をフリーズさせる。
- **マッピング先**: `Sampler` 波形表示下部にある `Playhead`（または `Start` 位置）マーカーに対して、`Macro` ノブからマッピングを行う。
- **操作手順**: `Macro` ノブをマウスで動かすことで、オーディオがこすられる（スクラッチ / グラニュラー）効果を出す。

### 3.2: 発音確率（Probability）
- **Device 構成**: `Note Grid` -> `Sampler` (足音やクリック音のワンショット)
- **Note Grid 内部の結線図**:
  1. `Transport` カテゴリから `Metro` (メトロノーム) を配置。
  2. `Logic` カテゴリから `Chance` (確率) を配置。
  3. `I/O` カテゴリから `Note Out` を配置。
  4. 結線: `[Metro] -> (Trigger) -> [Chance] -> (Trigger) -> [Note Out]`
- **Modulator**: `Note Grid` デバイスに `Macro` ノブを追加（名前を "System Load" に変更）。
- **マッピング先**: `Note Grid` 内部の `Chance` モジュールにある `Probability` パラメータ（%）。
- **操作手順**: `Macro` ノブを100%から徐々に下げていくことで、トリガーされるノートが間引きされ、後段の `Sampler` が不規則に鳴る状態を作る。
