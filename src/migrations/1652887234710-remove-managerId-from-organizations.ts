import { MigrationInterface, QueryRunner } from "typeorm";

export class removeManagerIdFromOrganizations1652887234710 implements MigrationInterface {
    name = 'removeManagerIdFromOrganizations1652887234710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP FOREIGN KEY \`FK_ed5626f6c86914a5a24f3943b3c\``);
        await queryRunner.query(`DROP INDEX \`REL_ed5626f6c86914a5a24f3943b3\` ON \`organizations\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`managerId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`managerId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_ed5626f6c86914a5a24f3943b3\` ON \`organizations\` (\`managerId\`)`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD CONSTRAINT \`FK_ed5626f6c86914a5a24f3943b3c\` FOREIGN KEY (\`managerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
