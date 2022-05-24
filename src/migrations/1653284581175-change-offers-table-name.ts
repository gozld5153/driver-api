import { MigrationInterface, QueryRunner } from "typeorm";

export class changeOffersTableName1653284581175 implements MigrationInterface {
    name = 'changeOffersTableName1653284581175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`offers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL, \`status\` enum ('pending', 'accepted', 'rejected', 'timeout', 'cancled') NOT NULL DEFAULT 'pending', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`orderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_dee629b1248f4ad48268faa9ea1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_159acc09a7917dbc85c018a3093\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_159acc09a7917dbc85c018a3093\``);
        await queryRunner.query(`ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_dee629b1248f4ad48268faa9ea1\``);
        await queryRunner.query(`DROP TABLE \`offers\``);
    }

}
