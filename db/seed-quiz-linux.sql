-- Linux基礎クイズ シードデータ
-- 実行例: docker exec -i mysql mysql -u root -p myapp < db/seed-quiz-linux.sql

SET NAMES utf8mb4;

-- 1. カテゴリ登録
SET @target_slug = 'linux';
SELECT @cat_id := id FROM quiz_category WHERE slug = @target_slug;
SET @cat_id = COALESCE(@cat_id, (SELECT COALESCE(MAX(id), 0) + 1 FROM quiz_category));

INSERT IGNORE INTO quiz_category (id, slug, category_name, author_id, description, display_order)
VALUES (@cat_id, @target_slug, 'Linux', 1, 'Linuxのコマンド操作・パーミッション・プロセス管理・ネットワークなど、実務で頻出する基礎知識に関するクイズです。', @cat_id);

-- 2. クイズデータ登録準備
SELECT @quiz_start := COALESCE(MAX(id), 0) + 1 FROM quiz;
SET @alter_sql = CONCAT('ALTER TABLE quiz AUTO_INCREMENT = ', @quiz_start);
PREPARE stmt FROM @alter_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. クイズ本体の登録 (10問)
INSERT INTO quiz (slug, category_id, author_id, question, explanation) VALUES

-- Q1: chmod パーミッション
('linux-chmod-755-meaning', @cat_id, 1,
 'Linuxで「chmod 755 script.sh」を実行した場合、設定されるパーミッションとして正しいのは？',
 '正解は「所有者は読み書き実行可能、グループと他ユーザーは読みと実行のみ可能」です。chmodの数字は3桁で、左から所有者・グループ・その他ユーザーの権限を表します。各桁は読み取り(4)・書き込み(2)・実行(1)の合計値です。755の場合、所有者=7(4+2+1)で全権限、グループ=5(4+1)で読み取りと実行、その他=5(4+1)で読み取りと実行となります。スクリプトファイルやWebサーバーの公開ディレクトリなどで広く使われるパーミッション設定です。chmod -R 755のように-Rオプションで再帰的に適用することもできます。'),

-- Q2: grep 文字列検索
('linux-grep-search-text', @cat_id, 1,
 'Linuxでファイル内の特定の文字列を検索するコマンドはどれか？',
 '正解は「grep」です。grepは指定したパターンに一致する行をファイルから検索して表示するコマンドです。基本的な使い方はgrep "検索文字列" ファイル名です。よく使うオプションとして、-i（大文字小文字を区別しない）、-r（ディレクトリを再帰的に検索）、-n（行番号を表示）、-c（一致した行数をカウント）、-l（一致したファイル名のみ表示）などがあります。正規表現を使った高度な検索にはgrep -Eまたはegrepを使用します。パイプと組み合わせてps aux | grep nginxのようにプロセスの絞り込みにも頻繁に使われます。'),

-- Q3: find ファイル検索
('linux-find-file-command', @cat_id, 1,
 'Linuxでファイル名を指定してファイルを検索するコマンドとして正しいものは？',
 '正解は「find / -name "filename"」です。findコマンドはディレクトリツリーを再帰的に検索してファイルやディレクトリを見つけます。基本構文はfind 検索開始パス -name "ファイル名"です。-inameで大文字小文字を区別しない検索、-type f でファイルのみ、-type dでディレクトリのみに絞り込めます。-mtimeで更新日時、-sizeでサイズによる検索も可能です。findの結果に対してコマンドを実行する-execオプション（例: find . -name "*.log" -exec rm {} \;）も実務で頻繁に使われます。locateコマンドはデータベースを使った高速検索ですが、事前にupdatedbの実行が必要です。'),

-- Q4: プロセス確認・停止 (ps / kill)
('linux-ps-kill-process', @cat_id, 1,
 'Linuxで実行中のプロセスを一覧表示し、特定のプロセスを終了させるコマンドの組み合わせとして正しいものは？',
 '正解は「psでプロセスを一覧表示し、killでプロセスを終了させる」です。ps auxは全ユーザーの全プロセスを詳細表示します。PID（プロセスID）を確認したらkill PIDで終了シグナル（デフォルトはSIGTERM）を送信します。プロセスが応答しない場合はkill -9 PID（SIGKILL）で強制終了できます。topやhtopコマンドではリアルタイムにプロセスのCPU・メモリ使用率を監視できます。プロセス名で直接killしたい場合はkillallやpkillが便利です。systemctlで管理されているサービスはsystemctl stop サービス名で停止するのが適切です。'),

-- Q5: ssh リモート接続
('linux-ssh-remote-connection', @cat_id, 1,
 'LinuxでSSHを使ってリモートサーバーに接続するコマンドとして正しいものは？',
 '正解は「ssh ユーザー名@ホスト名」です。SSHはSecure Shellの略で、暗号化された安全な通信路でリモートサーバーを操作するプロトコルです。基本構文はssh user@hostnameで、ポートを指定する場合は-pオプション（例: ssh -p 2222 user@host）を使います。パスワード認証より安全な公開鍵認証が推奨されており、ssh-keygenで鍵ペアを生成し、公開鍵をサーバーの~/.ssh/authorized_keysに登録します。~/.ssh/configにホスト設定を記述するとssh myhostのように短い名前で接続でき、実務では必須のテクニックです。'),

-- Q6: tar 圧縮・解凍
('linux-tar-compress-extract', @cat_id, 1,
 'Linuxで.tar.gz形式のファイルを解凍するコマンドとして正しいものは？',
 '正解は「tar -xzf ファイル名.tar.gz」です。tarはTape Archiveの略で、複数のファイルを1つにまとめる（アーカイブ）コマンドです。主なオプションは-c（作成）、-x（展開）、-z（gzip圧縮/解凍）、-f（ファイル名指定）、-v（詳細表示）です。圧縮はtar -czf archive.tar.gz ディレクトリ名、解凍はtar -xzf archive.tar.gz です。.tar.bz2形式の場合は-zの代わりに-jを使います。最近のGNU tarでは圧縮形式を自動判別するため、tar -xf archive.tar.gzのように-zを省略しても解凍できます。zipファイルの場合はunzipコマンドを使用します。'),

-- Q7: df / du ディスク容量確認
('linux-df-du-disk-usage', @cat_id, 1,
 'Linuxでディスクの使用容量を確認するコマンドとして、dfとduの違いは？',
 '正解は「dfはファイルシステム全体の使用状況、duはファイル・ディレクトリごとの使用量を表示する」です。df -hはマウントされたファイルシステムごとの使用量・空き容量を人間が読みやすい単位（GB/MB）で表示します。du -shはディレクトリの合計サイズを表示し、du -sh *でカレントディレクトリ内の各項目のサイズを確認できます。ディスク容量不足の原因調査ではdu -sh /var/* | sort -rhのようにサイズ順にソートして大きなディレクトリを特定する手法がよく使われます。ncduというインタラクティブなツールも便利です。'),

-- Q8: cron 定期実行
('linux-cron-crontab-schedule', @cat_id, 1,
 'Linuxで「毎日午前3時にスクリプトを自動実行する」ためのcrontab設定として正しいものは？',
 '正解は「0 3 * * * /path/to/script.sh」です。crontabの書式は「分 時 日 月 曜日 コマンド」の5つのフィールドで構成されます。*は「すべて」を意味し、0 3 * * *は「毎日3時0分」に実行されます。crontab -eで編集、crontab -lで現在の設定を一覧表示します。よく使う例として、*/5 * * * *（5分ごと）、0 0 * * 0（毎週日曜0時）、0 0 1 * *（毎月1日0時）などがあります。スクリプトではフルパスを使い、環境変数（PATHなど）はcrontab内で明示的に設定するのがトラブルを防ぐコツです。出力は2>&1でログファイルにリダイレクトしましょう。'),

-- Q9: シンボリックリンク
('linux-symbolic-link-ln-s', @cat_id, 1,
 'Linuxでシンボリックリンク（ソフトリンク）を作成するコマンドとして正しいものは？',
 '正解は「ln -s リンク先 リンク名」です。シンボリックリンクはWindowsのショートカットに似た仕組みで、別のファイルやディレクトリへの参照（ポインタ）を作成します。-sオプションなしのlnはハードリンクを作成します。シンボリックリンクはファイルシステムをまたげる、ディレクトリにも作成できるという利点がありますが、リンク先が削除されるとリンク切れ（dangling link）になります。実務ではnginxのsites-available/sites-enabledの管理、複数バージョンの切り替え（例: ln -s /usr/bin/python3 /usr/bin/python）などで頻繁に使われます。ls -lでリンク先を確認できます。'),

-- Q10: リダイレクトとパイプ
('linux-redirect-pipe-stdout', @cat_id, 1,
 'Linuxのシェルで「>」「>>」「|」の違いとして正しいものは？',
 '正解は「>は上書きリダイレクト、>>は追記リダイレクト、|はコマンドの出力を次のコマンドの入力に渡すパイプ」です。echo "hello" > file.txtはfile.txtの内容を上書きし、echo "world" >> file.txtは末尾に追記します。|（パイプ）はコマンドの標準出力を次のコマンドの標準入力に渡します（例: cat access.log | grep 404 | wc -l）。標準エラー出力のリダイレクトには2>を使い、標準出力と標準エラー出力の両方をリダイレクトする場合は&>または2>&1を使います。/dev/nullにリダイレクトすると出力を完全に破棄できます（例: command > /dev/null 2>&1）。');

-- 4. 選択肢の登録
INSERT INTO quiz_choice (quiz_id, choice_text, is_correct, display_order) VALUES
-- Q1: chmod パーミッション
(@quiz_start + 0, '所有者は読み書き実行可能、グループと他ユーザーは読みと実行のみ可能', 1, 1),
(@quiz_start + 0, '全ユーザーが読み書き実行可能', 0, 2),
(@quiz_start + 0, '所有者のみ読み書き実行可能、他は一切アクセス不可', 0, 3),
(@quiz_start + 0, '所有者は読み書き可能、グループと他ユーザーは読みのみ可能', 0, 4),
-- Q2: grep 文字列検索
(@quiz_start + 1, 'grep', 1, 1),
(@quiz_start + 1, 'find', 0, 2),
(@quiz_start + 1, 'locate', 0, 3),
(@quiz_start + 1, 'sed', 0, 4),
-- Q3: find ファイル検索
(@quiz_start + 2, 'find / -name "filename"', 1, 1),
(@quiz_start + 2, 'search / -name "filename"', 0, 2),
(@quiz_start + 2, 'grep -r "filename" /', 0, 3),
(@quiz_start + 2, 'ls -R / | match "filename"', 0, 4),
-- Q4: プロセス確認・停止
(@quiz_start + 3, 'psでプロセスを一覧表示し、killでプロセスを終了させる', 1, 1),
(@quiz_start + 3, 'topでプロセスを検索し、rmでプロセスを削除する', 0, 2),
(@quiz_start + 3, 'lsでプロセスを一覧表示し、stopでプロセスを停止する', 0, 3),
(@quiz_start + 3, 'findでプロセスを検索し、deleteでプロセスを削除する', 0, 4),
-- Q5: ssh リモート接続
(@quiz_start + 4, 'ssh ユーザー名@ホスト名', 1, 1),
(@quiz_start + 4, 'connect ユーザー名@ホスト名', 0, 2),
(@quiz_start + 4, 'remote -u ユーザー名 ホスト名', 0, 3),
(@quiz_start + 4, 'telnet ユーザー名@ホスト名', 0, 4),
-- Q6: tar 圧縮・解凍
(@quiz_start + 5, 'tar -xzf ファイル名.tar.gz', 1, 1),
(@quiz_start + 5, 'unzip ファイル名.tar.gz', 0, 2),
(@quiz_start + 5, 'gzip -d ファイル名.tar.gz', 0, 3),
(@quiz_start + 5, 'extract ファイル名.tar.gz', 0, 4),
-- Q7: df / du ディスク容量
(@quiz_start + 6, 'dfはファイルシステム全体の使用状況、duはファイル・ディレクトリごとの使用量を表示', 1, 1),
(@quiz_start + 6, 'dfはディレクトリごと、duはファイルシステム全体の使用量を表示', 0, 2),
(@quiz_start + 6, 'dfはCPU使用率、duはメモリ使用量を表示', 0, 3),
(@quiz_start + 6, 'dfとduは同じ機能で表示形式だけが異なる', 0, 4),
-- Q8: cron 定期実行
(@quiz_start + 7, '0 3 * * * /path/to/script.sh', 1, 1),
(@quiz_start + 7, '3 0 * * * /path/to/script.sh', 0, 2),
(@quiz_start + 7, '* * 3 * * /path/to/script.sh', 0, 3),
(@quiz_start + 7, '0 0 3 * * /path/to/script.sh', 0, 4),
-- Q9: シンボリックリンク
(@quiz_start + 8, 'ln -s リンク先 リンク名', 1, 1),
(@quiz_start + 8, 'link -s リンク先 リンク名', 0, 2),
(@quiz_start + 8, 'cp -l リンク先 リンク名', 0, 3),
(@quiz_start + 8, 'ln リンク先 リンク名（オプション不要）', 0, 4),
-- Q10: リダイレクトとパイプ
(@quiz_start + 9, '>は上書きリダイレクト、>>は追記リダイレクト、|はパイプ', 1, 1),
(@quiz_start + 9, '>は追記リダイレクト、>>は上書きリダイレクト、|はパイプ', 0, 2),
(@quiz_start + 9, '>も>>も同じ上書きリダイレクト、|はファイル結合', 0, 3),
(@quiz_start + 9, '>はファイル作成、>>はファイル削除、|はコマンド連結', 0, 4);
